-- ============================================================
-- Migración: permitir cambios de rol sin JWT
-- Corrige la migración 2026-10-04-110505: el trigger de
-- anti-self-promoción bloqueaba también al owner desde el
-- Dashboard (SQL Editor / Table Editor no llevan JWT de usuario).
-- Ahora: sin JWT → permitido; admin autenticado → permitido;
-- usuario normal → bloqueado.
-- Idempotente. Ejecutar en SQL Editor o supabase db push.
-- ============================================================

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

  -- Sin JWT (SQL Editor, Table Editor del Dashboard, service_role,
  -- migraciones): el owner / backend tiene carta blanca. Es la vía
  -- para promocionar el primer admin.
  IF acting_uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Usuario autenticado: sólo si es admin
  IF COALESCE((SELECT role FROM public.profiles WHERE id = acting_uid), 'user') = 'admin'
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'solo un admin puede cambiar roles';
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_role_change ON profiles;
CREATE TRIGGER enforce_profile_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_profile_role_change();
