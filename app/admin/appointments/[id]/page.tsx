import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { AppointmentDetail } from "@/components/admin/AppointmentDetail";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("appointments")
    .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const appt = data as AppointmentWithRelations;

  const [clientApptsRes, intakeRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, start_at, end_at, timezone, cancelled_at, type:appointment_types(name)")
      .eq("client_id", appt.client.id)
      .order("start_at", { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("intake_forms") as any)
      .select("completed_at, data")
      .eq("client_id", appt.client.id)
      .maybeSingle(),
  ]);

  const sessions = (clientApptsRes.data ?? []) as {
    id: string; start_at: string; end_at: string; timezone: string;
    cancelled_at: string | null; type: { name: string };
  }[];

  const intakeForm = intakeRes.data as { completed_at: string | null; data: Record<string, string> | null } | null;

  let intakeQuestions: { id: string; question: string; field_key: string }[] = [];
  if (intakeForm?.completed_at) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: qs } = await (supabase.from("intake_questions") as any)
      .select("id, question, field_key")
      .eq("is_active", true)
      .order("sort_order");
    intakeQuestions = qs ?? [];
  }

  return (
    <AppointmentDetail
      appointment={appt}
      sessions={sessions}
      intakeForm={intakeForm}
      intakeQuestions={intakeQuestions}
    />
  );
}
