-- ============================================================
-- Migración: administración de usuarios
-- Los admins pueden ver todos los profiles y gestionarlos
-- (rol y perfil); los usuarios normales siguen limitados a los suyos.
-- Idempotente.
-- ============================================================

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

-- Leer todos los profiles (sólo admins)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id OR public.is_admin());

-- Actualizar otros profiles (sólo admins; el trigger de roles sigue
-- protegiendo la auto-promoción de usuarios normales)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id OR public.is_admin())
  WITH CHECK ((select auth.uid()) = id OR public.is_admin());

-- Verificación
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;
