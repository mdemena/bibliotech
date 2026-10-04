"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("unauthorized");
  }
}

// ----------------------------------------
// Gestión de usuarios (SÓLO admins)
// ----------------------------------------

const roleSchema = z.enum(["user", "admin"]);

export async function setUserRole(
  userId: string,
  role: string,
): Promise<{ error: string | null }> {
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { error: "admin.invalid_role" };

  await assertAdmin();
  const supabase = await supabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/admin/users", "page");
  return { error: null };
}

export async function updateUserDisplayName(
  userId: string,
  displayName: string,
): Promise<{ error: string | null }> {
  await assertAdmin();
  const supabase = await supabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName.trim() || null })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/admin/users", "page");
  return { error: null };
}

// ----------------------------------------
// Catálogo maestro (SÓLO admins)
// ----------------------------------------

const catalogSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  author_id: z.string().uuid(),
  isbn: z.string().nullable().or(z.literal("")),
  language: z.string().optional(),
  cover_url: z.string().nullable().or(z.literal("")),
});

export async function updateCatalogBook(
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = catalogSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    author_id: formData.get("author_id"),
    isbn: formData.get("isbn") ?? "",
    language: formData.get("language") ?? "",
    cover_url: formData.get("cover_url") ?? "",
  });

  if (!parsed.success) return { error: "admin.invalid_form" };

  await assertAdmin();
  const supabase = await supabaseServerClient();

  const { id, title, author_id, isbn, language, cover_url } = parsed.data;
  const catalog = {
    title,
    author_id,
    isbn: isbn === "" ? null : isbn,
    language: language === "" ? null : language,
    cover_url: cover_url === "" ? null : cover_url,
  };

  const { error } = id
    ? await supabase.from("books").update(catalog).eq("id", id)
    : await supabase.from("books").insert(catalog);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/admin/books", "page");
  return { error: null };
}

export async function deleteCatalogBook(
  bookId: string,
): Promise<{ error: string | null }> {
  await assertAdmin();
  const supabase = await supabaseServerClient();

  // Borrado en cascada: borra además las copias (user_books) de los usuarios.
  const { error } = await supabase.from("books").delete().eq("id", bookId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/admin/books", "page");
  return { error: null };
}
