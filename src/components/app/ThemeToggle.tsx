"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({
  className,
  style = "icon",
}: {
  className?: string;
  style?: "icon" | "full";
}) {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = () => {
    const next = !(isDark ?? true);
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("bibliotech-theme", next ? "dark" : "light");
  };

  if (!style || style === "icon") {
    return (
      <button
        type="button"
        onClick={toggle}
        className={
          className ??
          "p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
        }
        aria-label="Cambiar tema"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={
        className ??
        "flex items-center w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
      }
    >
      {isDark ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
      {isDark ? "Modo Claro" : "Modo Oscuro"}
    </button>
  );
}
