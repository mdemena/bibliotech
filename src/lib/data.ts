import { supabaseServerClient } from "@/lib/supabase/server";
import type { Author, Book, LocationNode } from "@/types";
import { buildTree } from "@/lib/locations";

/**
 * La colección del usuario: una fila por combinación (user, book).
 * El catálogo global vive en `books`; aquí traemos los datos de catálogo
 * junto con la ubicación/valoración concretas de este usuario para que la
 * UI siga consumiendo la misma forma `Book` de siempre.
 */
export async function fetchBooks(): Promise<Book[]> {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("user_books")
    .select(
      "id, user_id, book_id, location_node_id, rating, created_at, book:books(*, author:authors(*)), location:location_nodes(*)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as UserBookRow[]).map(toUiBook);
}

export async function fetchBookById(id: string): Promise<Book | null> {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("user_books")
    .select(
      "id, user_id, book_id, location_node_id, rating, created_at, book:books(*, author:authors(*)), location:location_nodes(*), comments:book_comments(*)",
    )
    .eq("id", id)
    .single();

  if (error) return null;
  const row = data as unknown as UserBookRow & {
    comments: BookCommentRow[];
  };

  const book = toUiBook(row);
  book.comments = (row.comments ?? []).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return book;
}

export async function fetchAuthors(): Promise<Author[]> {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase.from("authors").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Author[];
}

export async function fetchLocations(): Promise<LocationNode[]> {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("location_nodes")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return (data ?? []) as LocationNode[];
}

export async function fetchLocationTree(): Promise<LocationNode[]> {
  return buildTree(await fetchLocations());
}

// ----------------------------------------
// Shape de la fila `user_books` con joins
// ----------------------------------------

interface CatalogBook {
  id: string;
  author_id: string | null;
  isbn: string | null;
  title: string;
  language: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  author?: Author | null;
}

interface UserBookRow {
  id: string;
  user_id: string;
  book_id: string;
  location_node_id: string | null;
  rating: number | null;
  created_at: string;
  book?: CatalogBook | null;
  location?: LocationNode | null;
}

interface BookCommentRow {
  id: string;
  book_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

/** Mapea la fila de colección a la forma `Book` que consume la UI. */
function toUiBook(row: UserBookRow): Book {
  const catalog = row.book;
  return {
    id: row.id,
    user_id: row.user_id,
    book_id: row.book_id,
    author_id: catalog?.author_id ?? null,
    location_node_id: row.location_node_id,
    title: catalog?.title ?? "",
    isbn: catalog?.isbn ?? null,
    language: catalog?.language ?? null,
    cover_url: catalog?.cover_url ?? null,
    rating: row.rating,
    created_at: row.created_at,
    updated_at: catalog?.updated_at ?? row.created_at,
    author: catalog?.author ?? null,
    location: row.location ?? null,
  };
}
