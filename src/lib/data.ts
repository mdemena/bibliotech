import { supabaseServerClient } from "@/lib/supabase/server";
import type { Author, Book, LocationNode } from "@/types";
import { buildTree } from "@/lib/locations";

export async function fetchBooks(): Promise<Book[]> {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("books")
    .select("*, author:authors(*), location:location_nodes(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Book[];
}

export async function fetchBookById(id: string): Promise<Book | null> {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("books")
    .select("*, author:authors(*), location:location_nodes(*), comments:book_comments(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  const book = data as Book;
  book.comments = (book.comments ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
