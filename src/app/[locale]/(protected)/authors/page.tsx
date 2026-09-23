import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { fetchAuthors } from "@/lib/data";
import { AuthorsClient } from "./AuthorsClient";

export default async function AuthorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const authors = await fetchAuthors();
  const t = await getTranslations("authors");

  return <AuthorsClient authors={authors} locale={locale} />
  ;
}
