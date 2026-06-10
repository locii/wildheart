import { createServiceClient } from "@/lib/supabase/server";
import { ClientsView } from "@/components/admin/ClientsView";
import type { Client } from "@/lib/supabase/types";

export default async function ClientsPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("last_name")
    .limit(50);

  return <ClientsView initialClients={(data ?? []) as Client[]} />;
}
