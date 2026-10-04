-- ============================================================
-- Migración: guardar el idioma elegido en el profile
-- El usuario logueado ve siempre la app en su idioma; el cambio de
-- idioma en el switcher se persiste para las próximas sesiones.
-- Idempotente.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS locale TEXT
  CHECK (locale IS NULL OR locale IN ('es', 'en', 'ca', 'gl', 'eu', 'fr'))
  DEFAULT NULL;
