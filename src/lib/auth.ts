import { cache } from "react";
import { supabaseServerClient } from "@/lib/supabase/server";

export type UserRole = "user" | "admin";

/**
 * Rol del usuario autenticado (memoizado por request con React cache).
 * Devuelve "user" por defecto si no hay sesión o no existe profile.
 */
export const getUserRole = cache(async (): Promise<UserRole | null> => {
  const supabase = await supabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) return null;

  return profile?.role === "admin" ? "admin" : "user";
});

export async function isAdmin(): Promise<boolean> {
  return (await getUserRole()) === "admin";
}
