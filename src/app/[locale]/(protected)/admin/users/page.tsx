import { setRequestLocale } from "next-intl/server";
import { fetchAdminUsers } from "@/lib/data";
import { AdminUsersClient } from "./AdminUsersClient";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const users = await fetchAdminUsers();

  return <AdminUsersClient users={users} />;
}
