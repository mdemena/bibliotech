import { setRequestLocale } from "next-intl/server";
import { AuthorsClient } from "@/app/[locale]/(protected)/authors/AuthorsClient";
import { fetchAuthors } from "@/lib/data";

export default async function AdminAuthorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const authors = await fetchAuthors();
  return <AuthorsClient authors={authors} locale={locale} />;
}
