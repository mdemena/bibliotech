"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServerClient } from "@/lib/supabase/server";

const authorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  nationality: z.string().nullable().or(z.literal("")),
  bio: z.string().nullable().or(z.literal("")),
});

function clean(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value : "";
  return str === "" ? null : str;
}

export async function saveAuthor(
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = authorSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    nationality: formData.get("nationality"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) return { error: "authors.invalid_form" };

  const supabase = await supabaseServerClient();
  const { id, name, nationality, bio } = parsed.data;
  const payload = { name, nationality: clean(nationality), bio: clean(bio) };

  const { error } = id
    ? await supabase.from("authors").update(payload).eq("id", id)
    : await supabase.from("authors").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/authors", "page");
  return { error: null };
}

export async function deleteAuthor(id: string): Promise<{ error: string | null }> {
  const supabase = await supabaseServerClient();
  const { error } = await supabase.from("authors").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/[locale]/authors", "page");
  return { error: null };
}
