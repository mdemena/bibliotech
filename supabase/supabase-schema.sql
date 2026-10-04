-- ============================================================
-- BiblioTech - Database Schema
-- Execute this in Supabase SQL Editor
-- ============================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Authors table (global master - shared across all users)
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nationality TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all authors"
  ON authors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert authors"
  ON authors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update authors"
  ON authors FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete authors"
  ON authors FOR DELETE
  TO authenticated
  USING (true);

-- 3. Location nodes (hierarchical tree per user)
CREATE TABLE IF NOT EXISTS location_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES location_nodes(id) ON DELETE CASCADE,
  level_name TEXT NOT NULL,       -- e.g. "Casa", "Habitación", "Mueble"
  name TEXT NOT NULL,             -- e.g. "Mi casa", "Salón", "Librería grande"
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE location_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own location nodes"
  ON location_nodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location nodes"
  ON location_nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own location nodes"
  ON location_nodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own location nodes"
  ON location_nodes FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Books (catálogo global compartido, desvinculado del usuario)
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  isbn TEXT,
  title TEXT NOT NULL,
  language TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all books"
  ON books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (true);

-- 4b. User books (colección por usuario: libro + ubicación + valoración)
CREATE TABLE IF NOT EXISTS user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
  location_node_id UUID REFERENCES location_nodes(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, book_id)
);

ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user books"
  ON user_books FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own user books"
  ON user_books FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own user books"
  ON user_books FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own user books"
  ON user_books FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 5. Book comments (sobre la copia del usuario: user_books.id)
-- 6. Trigger to auto-update updated_at on books
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_books_book_id ON user_books(book_id);
CREATE INDEX IF NOT EXISTS idx_books_location_node_id ON books(location_node_id);
CREATE INDEX IF NOT EXISTS idx_location_nodes_user_id ON location_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_location_nodes_parent_id ON location_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_book_comments_book_id ON book_comments(book_id);

-- 8. Push subscriptions (Web Push / PWA)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions(user_id);
