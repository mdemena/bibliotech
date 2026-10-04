"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServerClient, getAuthenticatedUserId } from "@/lib/supabase/server";

const bookSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  author_id: z.string().uuid(),
  location_node_id: z.string().uuid().nullable().or(z.literal("")),
  isbn: z.string().nullable().or(z.literal("")),
  language: z.string().optional(),
  rating: z.coerce.number().int().min(0).max(5).optional(),
  cover_url: z.string().nullable().or(z.literal("")),
});

function clean(value: string | null | undefined) {
  return value === "" || value === undefined ? null : value;
}

/**
 * Guarda un libro de la colección:
 * - actualiza/crea la entrada del usuario (`user_books`) con ubicación y rating
 * - actualiza/crea el libro del catálogo global (`books`) con los datos de
 *   catálogo (título, autor, ISBN…), reutilizando un ISBN existente para
 *   evitar duplicados en el catálogo compartido
 */
export async function saveBook(formData: FormData): Promise<{ error: string | null }> {
  const parsed = bookSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    author_id: formData.get("author_id"),
    location_node_id: formData.get("location_node_id") ?? "",
    isbn: formData.get("isbn") ?? "",
    language: formData.get("language") ?? undefined,
    rating: formData.get("rating") ?? 0,
    cover_url: formData.get("cover_url") ?? "",
  });

  if (!parsed.success) return { error: "books.invalid_form" };

  const supabase = await supabaseServerClient();
  const userId = await getAuthenticatedUserId();

  const {
    id,
    title,
    author_id,
    location_node_id,
    isbn,
    language,
    rating,
    cover_url,
  } = parsed.data;

  const catalogPayload = {
    title,
    author_id,
    isbn: clean(isbn),
    language: clean(language),
    cover_url: clean(cover_url),
  };
  const entryPayload = {
    location_node_id: clean(location_node_id),
    rating: rating && rating > 0 ? rating : null,
  };

  if (id) {
    // Editar: encontrar la entrada + el libro de catálogo vinculado
    const { data: entry, error: entryError } = await supabase
      .from("user_books")
      .select("id, book_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (entryError || !entry) return { error: "books.not_found" };

    const [entryResult, catalogResult] = await Promise.all([
      supabase.from("user_books").update(entryPayload).eq("id", id),
      supabase.from("books").update(catalogPayload).eq("id", entry.book_id),
    ]);

    if (entryResult.error) return { error: entryResult.error.message };
    if (catalogResult.error) return { error: catalogResult.error.message };
  } else {
    // Crear: reutilizar el libro del catálogo si ya existe (por ISBN o título)
    let bookId: string | null = null;

    const isbnValue = clean(isbn);
    const isbnFilter = isbnValue
      ? await supabase.from("books").select("id").eq("isbn", isbnValue).limit(1)
      : await supabase.from("books").select("id").eq("title", title).limit(1);

    if (!isbnFilter.error) {
      bookId = (isbnFilter.data?.[0] as { id: string } | undefined)?.id ?? null;
    }

    if (!bookId) {
      const { data: inserted, error: insertError } = await supabase
        .from("books")
        .insert(catalogPayload)
        .select()
        .single();

      if (insertError) return { error: insertError.message };
      bookId = (inserted as { id: string }).id;
    }

    // Si el usuario ya tiene este libro en su colección, no duplicar
    const { data: existingEntry, error: existingError } = await supabase
      .from("user_books")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();

    if (existingError) return { error: existingError.message };
    if (existingEntry) {
      const { error: updateError } = await supabase
        .from("user_books")
        .update(entryPayload)
        .eq("id", (existingEntry as { id: string }).id);

      if (updateError) return { error: updateError.message };
    } else {
      const { error: entryInsertError } = await supabase
        .from("user_books")
        .insert({ user_id: userId, book_id: bookId, ...entryPayload });

      if (entryInsertError) return { error: entryInsertError.message };
    }
  }

  revalidatePath("/[locale]/books", "page");
  revalidatePath("/[locale]/dashboard", "page");
  return { error: null };
}

/** Elimina solo la copia del usuario; el libro del catálogo global se queda. */
export async function deleteBook(id: string): Promise<{ error: string | null }> {
  const supabase = await supabaseServerClient();
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from("user_books")
    .delete()
    .match({ id, user_id: userId });

  if (error) return { error: error.message };

  revalidatePath("/[locale]/books", "page");
  revalidatePath("/[locale]/dashboard", "page");
  return { error: null };
}

export async function addComment(
  bookId: string,
  comment: string,
): Promise<{ error: string | null }> {
  if (!comment.trim()) return { error: "books.empty_comment" };
  const supabase = await supabaseServerClient();
  const userId = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("book_comments")
    .insert({ book_id: bookId, comment, user_id: userId });
  if (error) return { error: error.message };

  revalidatePath("/[locale]/books/[id]", "page");
  return { error: null };
}

export async function deleteComment(commentId: string): Promise<void> {
  const supabase = await supabaseServerClient();
  await supabase.from("book_comments").delete().eq("id", commentId);
  revalidatePath("/[locale]/books/[id]", "page");
}
