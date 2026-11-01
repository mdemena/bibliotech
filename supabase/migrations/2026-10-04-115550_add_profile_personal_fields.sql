-- ============================================================
-- Migración: datos personales del perfil
-- first_name / last_name (opcionales) + birth_date (opcional).
-- Editables desde /profile del área privada.
-- Idempotente.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Verificación
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
