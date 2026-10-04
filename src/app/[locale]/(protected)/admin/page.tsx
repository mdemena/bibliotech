import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} className="text-blue-600" />
          <CardTitle className="text-2xl font-extrabold tracking-tight">
            {t("title")}
          </CardTitle>
        </div>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-5">
          <li>{t("todo_master_data")}</li>
          <li>{t("todo_users")}</li>
          <li>{t("todo_catalog")}</li>
        </ul>
      </CardContent>
    </Card>
  );
}
