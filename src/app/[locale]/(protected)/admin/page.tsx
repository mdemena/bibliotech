import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Book, Users, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAdminUsers, fetchCatalog } from "@/lib/data";
import { isAdmin } from "@/lib/auth";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!(await isAdmin())) {
    redirect(`/${locale}/dashboard`);
  }

  const [t, tCommon, users, catalog] = await Promise.all([
    getTranslations("admin"),
    getTranslations("common"),
    fetchAdminUsers(),
    fetchCatalog(""),
  ]);

  const adminCount = users.filter((u) => u.role === "admin").length;

  const cards = [
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
      title: tCommon("admin_users"),
      href: `/${locale}/admin/users`,
      icon: Users,
      stats: [
        { label: t("users_count"), value: users.length },
        { label: tCommon("admin"), value: adminCount },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} className="text-blue-600" />
          <CardTitle className="text-2xl font-extrabold tracking-tight">
            {t("title")}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block group rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
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
      </CardContent>
    </Card>
  );
}
