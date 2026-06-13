import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { ClientDetail } from "@/components/admin/ClientDetail";
import { toClientSlug } from "@/lib/client-url";
import type { AppointmentWithRelations, Client, IntakeForm, IntakeQuestion } from "@/lib/supabase/types";

type Props = { params: Promise<{ id: string }> };

// Accepts a plain UUID or a name slug like "john-smith" / "john-smith-2"
async function resolveClientId(
  param: string,
  supabase: ReturnType<typeof createServiceClient>
): Promise<string | null> {
  // Plain UUID — use directly
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)) return param;

  // Slug: strip optional -N suffix to get base + 1-based index
  const indexMatch = param.match(/-(\d+)$/);
  const n = indexMatch ? parseInt(indexMatch[1]) : 1;
  const base = indexMatch ? param.slice(0, -indexMatch[0].length) : param;

  // Fetch all client names (lightweight) and match by generated slug
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("clients") as any)
    .select("id, first_name, last_name")
    .order("created_at", { ascending: true });

  const matches = (data ?? []).filter(
    (c: { first_name: string; last_name: string }) =>
      toClientSlug(c.first_name, c.last_name) === base
  );
  return (matches[n - 1] as { id: string } | undefined)?.id ?? null;
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

  const intakeForm = intakeRes.data as IntakeForm | null;

  // Only fetch questions if we have a completed form to display
  let intakeQuestions: IntakeQuestion[] = [];
  if (intakeForm?.completed_at) {
    const { data: qs } = await supabase
      .from("intake_questions")
      .select("*")
      .order("sort_order");
    intakeQuestions = (qs ?? []) as IntakeQuestion[];
  }

  return (
    <ClientDetail
      client={clientRes.data as Client}
      appointments={(appointmentsRes.data ?? []) as AppointmentWithRelations[]}
      intakeForm={intakeForm}
      intakeQuestions={intakeQuestions}
    />
  );
}
