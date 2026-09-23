"use client";

import { useActionState, useState, useTransition } from "react";
import { Book, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, signInWithGoogle } from "@/lib/actions/auth";
import { initialFormState, type FormState } from "@/lib/forms";

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

export function RegisterClient({
  locale,
}: {
  locale: string;
}) {
  const t = useTranslations("auth");
  const [formState, formAction, formPending] = useActionState<FormState, FormData>(
    signUp,
    initialFormState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [googlePending, startGoogle] = useTransition();

  const handleGoogle = () => {
    startGoogle(() => void signInWithGoogle(locale));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/30">
                <Book className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold dark:text-white">BiblioTech</span>
            </Link>
            <LanguageSwitcher variant="minimal" />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center pt-16 px-4 py-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-500/40 mb-5">
              <Book size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1">
              BiblioTech
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t("register_tagline")}</p>
          </div>

          <div className="bg-white dark:bg-[#121217] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8">
            {formState.error && (
              <div className="auth-error mb-5">
                <span>{formState.error}</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full py-3 rounded-xl font-semibold text-sm"
              onClick={handleGoogle}
              disabled={googlePending || formPending}
            >
              <GoogleLogo />
              {googlePending ? t("signing_in") : t("sign_up_google")}
            </Button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                {t("or_continue")}
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="display_name">{t("name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="display_name"
                    name="display_name"
                    type="text"
                    className="pl-10 py-3"
                    placeholder={t("name_placeholder")}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="pl-10 py-3"
                    placeholder={t("email_placeholder")}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-12 py-3"
                    placeholder={t("password_min_hint")}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm_password">{t("confirm_password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    className="pl-10 py-3"
                    placeholder={t("confirm_password_placeholder")}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-3 text-base" disabled={formPending}>
                {formPending ? t("creating_account") : t("create_account")}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("have_account")}{" "}
            <Link href="/login" className="auth-link">
              {t("sign_in")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
