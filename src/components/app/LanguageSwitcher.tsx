"use client";

import { useTransition } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { locales } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const languages = [
  { code: "es", name: "Español" },
  { code: "ca", name: "Català" },
  { code: "gl", name: "Galego" },
  { code: "eu", name: "Euskara" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
];

export function LanguageSwitcher({
  variant = "full",
}: {
  variant?: "minimal" | "full";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const current = useLocale();

  const changeLanguage = (locale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };

  if (variant === "minimal") {
    return (
      <div className="relative group">
        <button type="button" className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
          <ChevronsUpDown size={20} />
        </button>
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              disabled={pending}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                current === lang.code
                  ? "text-blue-600 font-bold"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {lang.name}
              {current === lang.code && <Check size={14} className="ml-auto" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          disabled={pending}
          onClick={() => changeLanguage(code)}
          className={cn(
            "px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50",
            current === code
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
          )}
        >
          {languages.find((l) => l.code === code)?.name ?? code}
        </button>
      ))}
    </div>
  );
}
