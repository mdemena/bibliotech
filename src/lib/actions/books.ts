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

const getBookAsUser = async () => {
  const supabase = await supabaseServerClient();
  const userId = await getAuthenticatedUserId();
  return { supabase, userId };
};

function clean(value: string | null | undefined) {
  return value === "" || value === undefined ? null : value;
}

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

  const { supabase } = await getBookAsUser();
  const { id, title, author_id, location_node_id, isbn, language, rating, cover_url } =
    parsed.data;

  const payload = {
    title,
    author_id,
    location_node_id: clean(location_node_id),
    isbn: clean(isbn),
    language: clean(language),
    rating: rating && rating > 0 ? rating : null,
    cover_url: clean(cover_url),
  };

  const { error } = id
    ? await supabase.from("books").update(payload).eq("id", id)
    : await supabase.from("books").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/books", "page");
  revalidatePath("/[locale]/dashboard", "page");
  return { error: null };
}

export async function deleteBook(id: string): Promise<{ error: string | null }> {
  const { supabase } = await getBookAsUser();
  const { error } = await supabase.from("books").delete().eq("id", id);
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
  const { supabase, userId } = await getBookAsUser();
  const { error } = await supabase
    .from("book_comments")
    .insert({ book_id: bookId, comment, user_id: userId });
  if (error) return { error: error.message };

  revalidatePath("/[locale]/books/[id]", "page");
  return { error: null };
}

export async function deleteComment(commentId: string): Promise<void> {
  const { supabase } = await getBookAsUser();
  await supabase.from("book_comments").delete().eq("id", commentId);
  revalidatePath("/[locale]/books/[id]", "page");
}
