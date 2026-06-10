import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { ClientDetail } from "@/components/admin/ClientDetail";
import type { AppointmentWithRelations, Client, IntakeForm } from "@/lib/supabase/types";

type Props = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
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
