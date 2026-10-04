"use client";

import { useState, useTransition } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Home, Book, Users, MapPin, Menu, LogOut, Settings, UserCircle,
  ShieldCheck, MessageSquare, Library, type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import type { UserRole } from "@/lib/auth";

interface AppShellProps {
  user: {
    email: string | undefined;
    displayName: string;
  };
  role: UserRole;
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function AppShell({ user, role, children }: AppShellProps) {
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

  const adminItems: NavItem[] = role === "admin"
    ? [
        { label: t("admin_books"), href: "/admin/books", icon: Book },
        { label: t("admin_authors"), href: "/admin/authors", icon: Library },
        { label: t("admin_comments"), href: "/admin/comments", icon: MessageSquare },
        { label: t("admin_users"), href: "/admin/users", icon: ShieldCheck },
        { label: t("admin_collections"), href: "/admin/collections", icon: MapPin },
      ]
    : [];

  const handleSignOut = () => startTransition(() => void signOut());

  const renderItems = (items: NavItem[], onClose: boolean) =>
    items.map((item) => {
      const isActive =
        pathname === item.href || pathname.startsWith(`${item.href}/`);
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn("nav-link group relative", isActive && "nav-link-active")}
          onClick={() => {
            if (onClose) setSidebarOpen(false);
          }}
        >
          <item.icon size={20} className="mr-3 transition-transform group-hover:scale-110" />
          <span className="relative z-10">{item.label}</span>
        </Link>
      );
    });

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

      <nav className="space-y-1">{renderItems(navItems, false)}</nav>

      {adminItems.length > 0 && (
        <nav className="space-y-1 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="px-4 pb-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            {t("admin")}
          </p>
          {renderItems(adminItems, false)}
        </nav>
      )}

      <div className="mt-auto space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">
            {t("language")}
          </p>
          <LanguageSwitcher />
        </div>

        <ThemeToggle style="full" />

        {/* Tarjeta de usuario fija al pie del sidebar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-3 mt-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer bg-transparent text-left"
            >
              <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                {user.displayName?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.displayName}
                </p>
                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
              </div>
              <Settings size={16} className="text-gray-400 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="dropdown-menu"
          >
            <Link
              href="/profile"
              className="dropdown-item cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <UserCircle size={16} className="mr-3" />
              {t("profile")}
            </Link>
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
  );

  return (
    <div className="main-layout">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-on" : ""}`}>
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
            <Link href="/dashboard" className="text-lg font-bold dark:text-white">
              BiblioTech
            </Link>
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
            <Link href="/profile" className="nav-link" title={t("profile")}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                {user.displayName?.[0]?.toUpperCase()}
              </div>
            </Link>
          </div>
        </div>

        <main className="main-content">
          {children}
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
