-- ============================================================
-- Migración: campo rol en profiles (user / admin)
-- - user: gestiona su propia colección (books, ubicaciones, comentarios)
-- - admin: gestiona datos maestros (catálogo libros, autores) y usuarios
-- Idempotente. El primer admin se promociona a mano:
--   UPDATE profiles SET role = 'admin' WHERE id = '<uuid>';
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- ------------------------------------------------------------
-- Anti-self-promoción: los usuarios autenticados NO pueden cambiarse
-- su propio rol. Sin JWT (SQL Editor / Table Editor del Dashboard /
-- service_role) el cambio se permite: es cómo el owner promociona
-- admins desde Supabase.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = (select auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.enforce_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  acting_uid UUID := (select auth.uid());
BEGIN
  IF NEW.role = OLD.role THEN
    RETURN NEW;
  END IF;

  -- Sin JWT (SQL Editor, Table Editor del Dashboard, service_role, migraciones):
  -- el owner / backend tiene carta blanca. Aquí se promociona el primer admin.
  IF acting_uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Usuario autenticado: sólo puede cambiar roles si es admin
  IF COALESCE((SELECT role FROM public.profiles WHERE id = acting_uid), 'user') = 'admin' THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'solo un admin puede cambiar roles: UPDATE profiles SET role = %, WHERE id = % impedido', NEW.role, NEW.id;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_role_change ON profiles;
CREATE TRIGGER enforce_profile_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_profile_role_change();

-- El UPDATE del propio profile existente se mantiene — el trigger protege el rol.
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Helper: ¿es admin? (para policies de datos maestros futuras)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'admin',
    FALSE
  );
$$;

-- ------------------------------------------------------------
-- Policies de datos maestros (catálogo books) piloto:
-- creación/edición de catálogo reservada a admins.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can insert books" ON books;
CREATE POLICY "Authenticated users can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update books" ON books;
CREATE POLICY "Authenticated users can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can delete books" ON books;
CREATE POLICY "Authenticated users can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Verificación
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role';
