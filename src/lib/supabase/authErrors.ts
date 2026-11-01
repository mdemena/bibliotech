import type { AuthError } from "@supabase/supabase-js";

/**
 * Mapea errores de Supabase Auth a claves i18n de `messages/*.json`.
 * Si no hay match, se devuelve el message crudo (último recurso).
 */
export function authErrorToKey(error: AuthError): string {
  switch (error.message) {
    case "Invalid login credentials":
      return "auth.invalid_credentials";
    case "Email not confirmed":
      return "auth.email_not_confirmed";
    case "Email rate limit exceeded":
      return "auth.too_many_requests";
    case "User already registered":
      return "auth.user_already_registered";
    case "Password should be at least 6 characters":
      return "auth.password_min_length";
    case "Signup requires a valid password":
      return "auth.password_min_length";
    default:
      return error.message;
  }
}
