import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { AppointmentWithRelations } from "@/lib/supabase/types";
import { dispatch } from "@/lib/notifications/dispatch";
import { createAppointmentToken, buildManageUrl } from "@/lib/tokens";
import { sendAdminSms } from "@/lib/notifications/sms";
import { sendAdminEmail } from "@/lib/notifications/email";
import { formatApptDateTime } from "@/lib/notifications/format";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("appointments")
    .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const appt = data as AppointmentWithRelations;

  // Fetch client session history and intake in parallel
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

  const allSessions = (clientApptsRes.data ?? []) as {
    id: string; start_at: string; end_at: string; timezone: string;
    cancelled_at: string | null; type: { name: string };
  }[];

  const intakeForm = intakeRes.data as { completed_at: string | null; data: Record<string, string> | null } | null;

  // Only fetch questions when intake is completed
  let intakeQuestions: { id: string; question: string; field_key: string }[] = [];
  if (intakeForm?.completed_at) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: qs } = await (supabase.from("intake_questions") as any)
      .select("id, question, field_key")
      .eq("is_active", true)
      .order("sort_order");
    intakeQuestions = qs ?? [];
  }

  return NextResponse.json({
    appointment: appt,
    sessions: allSessions,
    intakeForm,
    intakeQuestions,
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceClient();
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if (typeof body.paid === "boolean") updates.paid = body.paid;
  if (typeof body.amount_paid === "number") updates.amount_paid = body.amount_paid;
  if (body.cancelled === true) updates.cancelled_at = new Date().toISOString();
  if (body.start_at) {
    updates.start_at = body.start_at;
    updates.end_at = body.end_at;
    updates.rescheduled_at = new Date().toISOString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("appointments") as any)
    .update(updates)
    .eq("id", id)
    .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const appt = data as AppointmentWithRelations;
  const { date, time } = formatApptDateTime(appt.start_at, appt.end_at, appt.timezone);
  const clientName = `${appt.client.first_name} ${appt.client.last_name}`;

  // Send client cancellation notification if requested (admin-initiated)
  if (body.cancelled === true && (body.sendCancellationEmail || body.sendCancellationSms)) {
    const channels: ("email" | "sms")[] = [
      ...(body.sendCancellationEmail ? ["email" as const] : []),
      ...(body.sendCancellationSms ? ["sms" as const] : []),
    ];
    dispatch(supabase, "cancellation", appt, { channels }).catch(console.error);
  }

  // Notify admin when a client cancels via the manage page
  if (body.cancelled === true && body.source === "client") {
    const msg = `${clientName} cancelled their ${appt.type.name} on ${date} at ${time}`;
    sendAdminSms(msg).catch(console.error);
    sendAdminEmail(`Booking cancelled — ${clientName}`, msg).catch(console.error);
  }

  // Send client reschedule confirmation if requested (admin-initiated)
  if (body.start_at && (body.sendRescheduleEmail || body.sendRescheduleSms)) {
    const channels: ("email" | "sms")[] = [
      ...(body.sendRescheduleEmail ? ["email" as const] : []),
      ...(body.sendRescheduleSms ? ["sms" as const] : []),
    ];
    const token = await createAppointmentToken(supabase, appt.id, appt.start_at);
    const manageUrl = buildManageUrl(token);
    dispatch(supabase, "reschedule", appt, { channels, manageUrl }).catch(console.error);
  }

  return NextResponse.json({ appointment: appt });
}
