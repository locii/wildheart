import { createServiceClient } from "@/lib/supabase/server";
import { ClientsView } from "@/components/admin/ClientsView";
import type { Client } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

export default async function ClientsPage() {
  const supabase = createServiceClient();
  const { data, count } = await supabase
    .from("clients")
    .select("*", { count: "exact" })
    .order("last_name")
    .range(0, PER_PAGE - 1);

  return (
    <ClientsView
      initialClients={(data ?? []) as Client[]}
      initialTotal={count ?? 0}
    />
  );
}
