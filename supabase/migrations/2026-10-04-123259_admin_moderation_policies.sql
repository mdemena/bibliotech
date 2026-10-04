-- ============================================================
-- Migración: moderación de comentarios y gestión de colecciones
-- Los admins pueden ver/editar/borrar cualquier comentario y
-- ver/editar/borrar la entrada (user_books) de cualquier usuario.
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

-- ------------------------------------------------------------
-- book_comments
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all book comments" ON book_comments;
CREATE POLICY "Admins can view all book comments"
  ON book_comments FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update all book comments" ON book_comments;
CREATE POLICY "Admins can update all book comments"
  ON book_comments FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id OR public.is_admin())
  WITH CHECK ((select auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can delete all book comments" ON book_comments;
CREATE POLICY "Admins can delete all book comments"
  ON book_comments FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id OR public.is_admin());

-- ------------------------------------------------------------
-- user_books (colecciones de usuarios)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all user books" ON user_books;
CREATE POLICY "Admins can view all user books"
  ON user_books FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update all user books" ON user_books;
CREATE POLICY "Admins can update all user books"
  ON user_books FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id OR public.is_admin())
  WITH CHECK ((select auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can delete all user books" ON user_books;
CREATE POLICY "Admins can delete all user books"
  ON user_books FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id OR public.is_admin());

-- Verificación
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('book_comments', 'user_books')
ORDER BY tablename, policyname;
