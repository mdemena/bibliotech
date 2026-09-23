"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServerClient, getAuthenticatedUserId } from "@/lib/supabase/server";

const locationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  level_name: z.string().min(1),
  parent_id: z.string().uuid().nullable().or(z.literal("")),
});

export async function saveLocation(
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = locationSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    level_name: formData.get("level_name"),
    parent_id: formData.get("parent_id") ?? "",
  });

  if (!parsed.success) return { error: "locations.invalid_form" };

  const supabase = await supabaseServerClient();
  const { id, name, level_name, parent_id } = parsed.data;
  const payload = {
    name,
    level_name,
    parent_id: parent_id === "" ? null : parent_id,
  };

  const { error } = id
    ? await supabase.from("location_nodes").update(payload).eq("id", id)
    : await supabase.from("location_nodes").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/locations", "page");
  revalidatePath("/[locale]/dashboard", "page");
  return { error: null };
}

export async function deleteLocation(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await supabaseServerClient();
  const userId = await getAuthenticatedUserId();
  const { error } = await supabase.from("location_nodes").delete().match({ id, user_id: userId });
  if (error) return { error: error.message };

  revalidatePath("/[locale]/locations", "page");
  return { error: null };
}
