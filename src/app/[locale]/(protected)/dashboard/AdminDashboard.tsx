import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Book, Users, ShieldCheck } from "lucide-react";
import UserDashboard from "./UserDashboard";
import { fetchAdminUsers, fetchCatalog } from "@/lib/data";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const tCommon = await getTranslations("common");
  const [users, catalog] = await Promise.all([fetchAdminUsers(), fetchCatalog("")]);

  const adminCount = users.filter((u) => u.role === "admin").length;

  const adminCards = [
    {
      title: tCommon("admin_books"),
      href: `/${locale}/admin/books`,
      icon: Book,
      value: catalog.length,
      label: t("catalog"),
    },
    {
      title: tCommon("admin_users"),
      href: `/${locale}/admin/users`,
      icon: Users,
      value: users.length,
      label: t("users_count"),
    },
    {
      title: tCommon("admin"),
      href: `/${locale}/admin`,
      icon: ShieldCheck,
      value: adminCount,
      label: tCommon("admin"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Accesos rápidos de gestión (solo admin) */}
      <section className="px-4 py-2 md:px-8 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {adminCards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex items-center gap-4 p-5 bg-white dark:bg-[#121217] rounded-2xl border border-gray-200 dark:border-gray-800 hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 shrink-0">
                <c.icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {c.label}
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                  {c.value}
                </p>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors truncate">
                  {c.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Colección personal (el admin también tiene la suya) */}
      <UserDashboard params={params} />
    </div>
  );
}
