import { setRequestLocale } from "next-intl/server";
import { fetchAdminCollections, fetchLocations } from "@/lib/data";
import { AdminCollectionsClient } from "./AdminCollectionsClient";

export default async function AdminCollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [collections, locations] = await Promise.all([fetchAdminCollections(), fetchLocations()]);
  return <AdminCollectionsClient collections={collections} locations={locations} />;
}
