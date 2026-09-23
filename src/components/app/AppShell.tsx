"use client";

import { useState, useTransition } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Home, Book, Users, MapPin, Menu, LogOut, ChevronsUpDown, Settings,
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

interface AppShellProps {
  user: {
    email: string | undefined;
    displayName: string;
  };
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function AppShell({ user, children }: AppShellProps) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const navItems: NavItem[] = [
    { label: t("dashboard"), href: "/dashboard", icon: Home },
    { label: t("books"), href: "/books", icon: Book },
    { label: t("authors"), href: "/authors", icon: Users },
    { label: t("locations"), href: "/locations", icon: MapPin },
  ];

  const handleSignOut = () => startTransition(() => void signOut());

  const navContent = (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center space-x-3 px-4 mb-10">
        <div className="bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-500/40">
          <Book size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          BiblioTech
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-link group relative", isActive && "nav-link-active")}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} className="mr-3 transition-transform group-hover:scale-110" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">
            {t("language")}
          </p>
          <LanguageSwitcher />
        </div>

        <ThemeToggle style="full" />
      </div>
    </div>
  );

  return (
      <div className="main-layout">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`sidebar ${sidebarOpen ? "sidebar-on" : "sidebar-off"}`}>
          {navContent}
        </aside>

        <div className="content-area">
          <header className="header">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen((open) => !open)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                aria-label="Toggle sidebar"
              >
                <Menu size={24} />
              </button>
              <span className="text-lg font-bold dark:text-white">BiblioTech</span>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSwitcher variant="minimal" />
              <ThemeToggle />
            </div>
          </header>

          <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 w-96">
              <Book className="text-gray-400 mr-3" size={18} />
              <input
                type="text"
                placeholder={t("search")}
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="minimal" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="user-button text-gray-700 dark:text-gray-200 bg-transparent border-none cursor-pointer">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                      {user.displayName?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm hidden lg:block ml-2">
                      {user.displayName}
                    </span>
                    <ChevronsUpDown size={16} className="ml-2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dropdown-menu">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 -mt-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-tighter">
                      {t("account")}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem className="dropdown-item cursor-pointer opacity-50 pointer-events-none">
                    <Settings size={16} className="mr-3" />
                    {t("settings")}
                  </DropdownMenuItem>
                  <button
                    className="dropdown-item text-red-600 dark:text-red-400 cursor-pointer"
                    onClick={handleSignOut}
                    disabled={pending}
                  >
                    <LogOut size={16} className="mr-3" />
                    {t("logout")}
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <main className="main-content">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>

        <Link
          href="/books"
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center z-50 hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Book size={24} />
        </Link>
      </div>
  );
}
