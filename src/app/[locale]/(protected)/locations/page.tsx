import { setRequestLocale } from "next-intl/server";
import { fetchLocations } from "@/lib/data";
import { buildTree } from "@/lib/locations";
import { LocationsClient } from "./LocationsClient";

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tree = buildTree(await fetchLocations());
  return <LocationsClient tree={tree} />;
}
