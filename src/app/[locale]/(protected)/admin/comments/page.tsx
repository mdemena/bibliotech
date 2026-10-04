import { setRequestLocale } from "next-intl/server";
import { fetchAdminComments, fetchLocations } from "@/lib/data";
import { AdminCommentsClient } from "./AdminCommentsClient";

export default async function AdminCommentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const comments = await fetchAdminComments();
  return <AdminCommentsClient comments={comments} />;
}
