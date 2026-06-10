import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { ClientDetail } from "@/components/admin/ClientDetail";
import type { AppointmentWithRelations, Client, IntakeForm } from "@/lib/supabase/types";

type Props = { params: Promise<{ id: string }> };

// Accepts plain UUID or "firstname-lastname-uuid" slug format
function extractUuid(param: string): string {
  const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const match = param.match(uuidRe);
  return match ? match[0] : param;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = extractUuid(rawId);
  const supabase = createServiceClient();

  const [clientRes, appointmentsRes, intakeRes] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("appointments")
      .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
      .eq("client_id", id)
      .order("start_at", { ascending: false }),
    supabase.from("intake_forms").select("*").eq("client_id", id).maybeSingle(),
  ]);

  if (!clientRes.data) notFound();

  return (
    <ClientDetail
      client={clientRes.data as Client}
      appointments={(appointmentsRes.data ?? []) as AppointmentWithRelations[]}
      intakeForm={intakeRes.data as IntakeForm | null}
    />
  );
}
