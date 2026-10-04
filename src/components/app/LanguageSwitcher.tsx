"use client";

import { useTransition } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { locales } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: "es", name: "Español" },
  { code: "ca", name: "Català" },
  { code: "gl", name: "Galego" },
  { code: "eu", name: "Euskara" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
];

/** Banderas como SVG inline (los emojis de bandera no renderizan igual en todos los SO). */
function Flag({ code, size = 20 }: { code: string; size?: number }) {
  const common = { width: size, height: size * 0.75, className: "rounded-[2px] shadow-sm" };

  switch (code) {
    case "es":
      return (
        <svg viewBox="0 0 30 22" {...common} aria-hidden="true">
          <rect width="30" height="22" fill="#AA151B" />
          <rect y="5.5" width="30" height="11" fill="#F1BF00" />
        </svg>
      );
    case "ca":
      return (
        <svg viewBox="0 0 30 22" {...common} aria-hidden="true">
          <rect width="30" height="22" fill="#FCDD09" />
          {[0, 3, 6, 9, 12, 15, 18, 21].map((y) => (
            <rect key={y} y={y * 1.4} width="30" height="1.4" fill="#DA121A" />
          ))}
        </svg>
      );
    case "gl":
      return (
        <svg viewBox="0 0 30 22" {...common} aria-hidden="true">
          <rect width="30" height="22" fill="#fff" />
          <path d="M0 0 L30 22" stroke="#0055A5" strokeWidth="5" />
          <path d="M30 0 L0 22" stroke="#0055A5" strokeWidth="5" />
        </svg>
      );
    case "eu":
      return (
        <svg viewBox="0 0 30 22" {...common} aria-hidden="true">
          <rect width="30" height="22" fill="#D52B1E" />
          <path d="M1 1 L29 21" stroke="#fff" strokeWidth="5" />
          <path d="M29 1 L1 21" stroke="#fff" strokeWidth="5" />
          <path d="M0 0 L30 22" stroke="#009B48" strokeWidth="3" />
          <path d="M30 0 L0 22" stroke="#009B48" strokeWidth="3" />
        </svg>
      );
    case "en":
      return (
        <svg viewBox="0 0 30 22" {...common} aria-hidden="true">
          <rect width="30" height="22" fill="#012169" />
          <path d="M0 0 L30 22 M30 0 L0 22" stroke="#fff" strokeWidth="4" />
          <path d="M0 0 L30 22 M30 0 L0 22" stroke="#C8102E" strokeWidth="2" />
          <rect y="9" width="30" height="4" fill="#fff" />
          <rect x="13" width="4" height="22" fill="#fff" />
          <rect y="10" width="30" height="2" fill="#C8102E" />
          <rect x="14" width="2" height="22" fill="#C8102E" />
        </svg>
      );
    case "fr":
      return (
        <svg viewBox="0 0 30 22" {...common} aria-hidden="true">
          <rect width="10" height="22" fill="#002395" />
          <rect x="10" width="10" height="22" fill="#fff" />
          <rect x="20" width="10" height="22" fill="#ED2939" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 30 22" {...common} aria-hidden="true">
          <rect width="30" height="22" fill="#666" />
        </svg>
      );
  }
}

export function LanguageSwitcher({
  variant = "full",
}: {
  variant?: "minimal" | "full";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const current = useLocale();
  const [pending, startTransition] = useTransition();

  const changeLanguage = (locale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };

  if (variant === "minimal") {
    return (
      <div className="relative group">
        <button
          type="button"
          className="p-2 flex items-center gap-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <Flag code={current} size={20} />
        </button>

        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              disabled={pending ?? false}
              onClick={() => changeLanguage(lang.code)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer",
                current === lang.code
                  ? "text-blue-600 font-bold"
                  : "text-gray-700 dark:text-gray-200",
              )}
            >
              <Flag code={lang.code} size={16} />
              <span className="truncate">{lang.name}</span>
              {current === lang.code && <Check size={14} className="ml-auto" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          disabled={pending ?? false}
          onClick={() => changeLanguage(lang.code)}
          className={cn(
            "px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 disabled:opacity-50",
            current === lang.code
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
          )}
        >
          <Flag code={lang.code} size={14} />
          <span className="truncate">{lang.name}</span>
        </button>
      ))}
    </div>
  );
}
