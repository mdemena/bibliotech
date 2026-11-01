import { setRequestLocale } from "next-intl/server";
import { fetchAdminCollections, fetchLocations } from "@/lib/data";
import { AdminLocationsClient } from "./AdminLocationsClient";

export default async function AdminLocationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const [collections, locations] = await Promise.all([fetchAdminCollections(), fetchLocations()]);
  return <AdminLocationsClient collections={collections} locations={locations} />;
}
