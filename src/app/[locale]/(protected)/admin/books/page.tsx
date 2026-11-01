import { setRequestLocale } from "next-intl/server";
import { fetchAuthors, fetchCatalog } from "@/lib/data";
import { AdminCatalogClient } from "./AdminCatalogClient";

export default async function AdminBooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [catalog, authors] = await Promise.all([fetchCatalog(""), fetchAuthors()]);

  return <AdminCatalogClient catalog={catalog} authors={authors} />;
}
