import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { fetchAuthors, fetchBooks } from "@/lib/data";
import { BooksClient } from "./BooksClient";

export default async function BooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [books, authors] = await Promise.all([fetchBooks(), fetchAuthors()]);

  return <BooksClient books={books} authors={authors} />;
}
