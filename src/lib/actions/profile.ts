"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServerClient, getAuthenticatedUserId } from "@/lib/supabase/server";

const profileSchema = z.object({
  first_name: z.string().max(80).nullable().or(z.literal("")),
  last_name: z.string().max(80).nullable().or(z.literal("")),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "invalid_date")
    .nullable()
    .or(z.literal("")),
  locale: z
    .enum(["es", "en", "ca", "gl", "eu", "fr"])
    .nullish()
    .or(z.literal("")),
});

function clean(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value : "";
  return str === "" ? null : str;
}

/** Actualiza los datos personales del usuario autenticado (opcional: idioma). */
export async function updateProfile(
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = profileSchema.safeParse({
    first_name: formData.get("first_name") ?? "",
    last_name: formData.get("last_name") ?? "",
    birth_date: formData.get("birth_date") ?? "",
    locale: formData.get("locale") ?? "",
  });

  if (!parsed.success) return { error: "profile.invalid_form" };

  const supabase = await supabaseServerClient();
  const userId = await getAuthenticatedUserId();

  const localeValue = parsed.data.locale ?? "";
  const payload: {
    first_name?: string | null;
    last_name?: string | null;
    birth_date?: string | null;
    locale?: string | null;
  } = {
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    birth_date: parsed.data.birth_date,
  };

  if (localeValue) payload.locale = localeValue;

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/profile", "page");
  revalidatePath("/[locale]/dashboard", "page");
  return { error: null };
}
