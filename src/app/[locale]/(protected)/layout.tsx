import { supabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/AppShell";
import { ServiceWorkerRegistrar } from "@/components/app/ServiceWorkerRegistrar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.display_name ??
    user?.email?.split("@")[0] ??
    "Usuario";

  return (
    <AppShell
      user={{
        email: user?.email,
        displayName,
      }}
    >
      <ServiceWorkerRegistrar />
      {children}
    </AppShell>
  );
}
