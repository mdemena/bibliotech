"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServerClient, getAuthenticatedUserId } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";

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
 * Garantiza un libro en el catálogo global (books):
 * 1. busca por ISBN exacto (si hay)
 * 2. si no, busca por título
 * 3. si no existe en ningún caso, lo INSERTA
 * Devuelve el id del libro del catálogo, o el error.
 */
async function ensureCatalogBook(
  supabase: Awaited<ReturnType<typeof supabaseServerClient>>,
  catalog: {
    title: string;
    author_id: string;
    isbn: string | null;
    language: string | null;
    cover_url: string | null;
  },
): Promise<{ bookId: string | null; error: string | null }> {
  if (catalog.isbn) {
    const { data, error } = await supabase
      .from("books")
      .select("id")
      .eq("isbn", catalog.isbn)
      .limit(1);

    if (error) return { bookId: null, error: error.message };
    const found = (data?.[0] as { id: string } | undefined)?.id;
    if (found) return { bookId: found, error: null };
  }

  const byTitle = await supabase
    .from("books")
    .select("id")
    .eq("title", catalog.title)
    .limit(1);

  if (byTitle.error) return { bookId: null, error: byTitle.error.message };

  const found = (byTitle.data?.[0] as { id: string } | undefined)?.id;
  if (found) return { bookId: found, error: null };

  // No existe en el catálogo → se crea el libro nuevo en la tabla maestra
  const { data: inserted, error: insertError } = await supabase
    .from("books")
    .insert(catalog)
    .select()
    .single();

  if (insertError) return { bookId: null, error: insertError.message };
  return { bookId: (inserted as { id: string }).id, error: null };
}

/**
 * Guarda un libro de la colección:
 * - actualiza/crea la entrada del usuario (`user_books`) con ubicación y rating
 * - garantiza el libro en el catálogo global (`books`) con `ensureCatalogBook`
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
  const role = await getUserRole();
  const isAdmin = role === "admin";

  if (id) {
    // Editar: encontrar la entrada + el libro de catálogo vinculado
    const { data: entry, error: entryError } = await supabase
      .from("user_books")
      .select("id, book_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (entryError || !entry) return { error: "books.not_found" };

    // El catálogo maestro (título/ISBN/portada) solo lo toca un admin; el resto
    // de usuarios solo puede actualizar su copia (ubicación/valoración).
    const entryResult = await supabase
      .from("user_books")
      .update(entryPayload)
      .eq("id", id);

    const catalogResult = isAdmin
      ? await supabase.from("books").update(catalogPayload).eq("id", entry.book_id)
      : { error: null };

    if (entryResult.error) return { error: entryResult.error.message };
    if (catalogResult.error) return { error: catalogResult.error.message };
  } else {
    // Crear: garantizar el libro en la tabla maestra (buscar por ISBN/título)
    const guaranteed = await ensureCatalogBook(supabase, catalogPayload);
    if (guaranteed.error) return { error: guaranteed.error };
    const bookId = guaranteed.bookId;
    if (!bookId) return { error: "books.could_not_create" };

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

// ----------------------------------------
// Escáner de código de barras (ISBN)
// ----------------------------------------

const isbnSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .pipe(z.string().min(8).max(17));

export type CheckIsbnResult = {
  status: "owned" | "catalog" | "unknown";
  /** entry_id si status === "owned" */
  entry_id?: string;
  /** datos de catálogo si exists en books (owned también) */
  title?: string;
  author_id?: string | null;
  language?: string | null;
  cover_url?: string | null;
};

/**
 * Comprueba un ISBN escaneado:
 * - "owned": el usuario ya tiene el libro en su colección
 * - "catalog": existe en la tabla maestra (pero no en su colección)
 * - "unknown": no existe en el catálogo → hay que crearlo
 */
export async function checkIsbn(isbn: string): Promise<CheckIsbnResult> {
  const parsed = isbnSchema.safeParse(isbn);
  if (!parsed.success) return { status: "unknown" };

  const cleaned = parsed.data;
  const supabase = await supabaseServerClient();
  const userId = await getAuthenticatedUserId();

  const { data: catalogRow } = await supabase
    .from("books")
    .select("id, title, author_id, language, cover_url")
    .eq("isbn", cleaned)
    .limit(1)
    .maybeSingle();

  const catalog = catalogRow as
    | { id: string; title: string; author_id: string | null; language: string | null; cover_url: string | null }
    | null;

  if (!catalog) {
    return { status: "unknown" };
  }

  const { data: owned } = await supabase
    .from("user_books")
    .select("id")
    .match({ user_id: userId, book_id: catalog.id })
    .maybeSingle();

  if (owned) {
    return {
      status: "owned",
      entry_id: (owned as { id: string }).id,
      title: catalog.title,
      author_id: catalog.author_id,
      language: catalog.language,
      cover_url: catalog.cover_url,
    };
  }

  return {
    status: "catalog",
    title: catalog.title,
    author_id: catalog.author_id,
    language: catalog.language,
    cover_url: catalog.cover_url,
  };
}
