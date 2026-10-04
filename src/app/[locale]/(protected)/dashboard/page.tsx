import { setRequestLocale } from "next-intl/server";
import { getUserRole } from "@/lib/auth";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const role = await getUserRole();

  return role === "admin" ? (
    <AdminDashboard params={params} />
  ) : (
    <UserDashboard params={params} />
  );
}
