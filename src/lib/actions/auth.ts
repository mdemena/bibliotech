"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServerClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/forms";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signUpSchema = z
  .object({
    display_name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "auth.passwords_no_match",
  });

export async function signIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "auth.invalid_credentials" };

  const { email, password } = parsed.data;
  const supabase = await supabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function signUp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    display_name: formData.get("display_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "auth.invalid_form" };
  }

  const { display_name, email, password } = parsed.data;
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name } },
  });

  if (error) return { error: error.message };
  if (data.user) redirect("/login");
  return { error: null };
}

export async function signInWithGoogle(locale: string): Promise<void> {
  const supabase = await supabaseServerClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?locale=${locale}`,
    },
  });

  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const supabase = await supabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
