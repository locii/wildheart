import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { ClientDetail } from "@/components/admin/ClientDetail";
import type { AppointmentWithRelations, Client, IntakeForm } from "@/lib/supabase/types";

type Props = { params: Promise<{ id: string }> };

// Accepts plain UUID or "firstname-lastname-shortid" slug format.
// shortId is the first 8 hex chars of the UUID (no dashes).
async function resolveClientId(param: string, supabase: ReturnType<typeof createServiceClient>): Promise<string | null> {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)) return param;
  const shortId = param.split("-").pop() ?? "";
  if (!/^[0-9a-f]{8}$/i.test(shortId)) return param;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("clients") as any).select("id").ilike("id", `${shortId}%`).maybeSingle();
  return data?.id ?? null;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id: rawId } = await params;
  const supabase = createServiceClient();
  const id = await resolveClientId(rawId, supabase);
  if (!id) notFound();

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
