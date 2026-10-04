import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Book, Users, ShieldCheck, MessageSquare, MapPin, type LucideIcon } from "lucide-react";
import { fetchAdminUsers, fetchCatalog, fetchAdminComments, fetchAdminCollections } from "@/lib/data";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const tCommon = await getTranslations("common");
  const [users, catalog, comments, collections] = await Promise.all([
    fetchAdminUsers(),
    fetchCatalog(""),
    fetchAdminComments(),
    fetchAdminCollections(),
  ]);

  const adminCount = users.filter((u) => u.role === "admin").length;

  const cards: {
    title: string;
    href: string;
    icon: LucideIcon;
    stats: { label: string; value: string | number }[];
  }[] = [
    {
      title: tCommon("admin_books"),
      href: `/${locale}/admin/books`,
      icon: Book,
      stats: [
        { label: t("catalog"), value: catalog.length },
        { label: t("owners_in_use"), value: catalog.filter((b) => b.owners_count > 0).length },
      ],
    },
    {
      title: tCommon("authors"),
      href: `/${locale}/admin/authors`,
      icon: Users,
      stats: [{ label: t("authors_col_count"), value: new Set(catalog.map((b) => b.author?.id)).size }],
    },
    {
      title: tCommon("admin_comments"),
      href: `/${locale}/admin/comments`,
      icon: MessageSquare,
      stats: [{ label: t("comments_count"), value: comments.length }],
    },
    {
      title: tCommon("admin_users"),
      href: `/${locale}/admin/users`,
      icon: ShieldCheck,
      stats: [
        { label: t("users_count"), value: users.length },
        { label: tCommon("admin"), value: adminCount },
      ],
    },
    {
      title: tCommon("admin_collections"),
      href: `/${locale}/admin/collections`,
      icon: MapPin,
      stats: [
        { label: t("entries_count"), value: collections.length },
        { label: t("rated_entries"), value: collections.filter((c) => c.rating).length },
      ],
    },
  ];

  return (
    <div className="px-4 py-6 md:px-8 space-y-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-blue-600" size={28} />
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {t("panel_title")}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group card p-8 border-none dark:bg-[#121217] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                <c.icon size={22} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {c.title}
              </h3>
            </div>
            <div className="flex gap-8">
              {c.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    {s.label}
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
