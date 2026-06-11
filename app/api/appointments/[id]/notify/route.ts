import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { dispatch, type NotificationType } from "@/lib/notifications/dispatch";
import { sendEmail } from "@/lib/notifications/email";
import { createAppointmentToken } from "@/lib/tokens";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

type Ctx = { params: Promise<{ id: string }> };

// "intake" is sent directly without DB logging (not in notifications table constraint)
type ManualNotifyType = NotificationType | "intake";

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceClient();

  const body = await req.json() as {
    type: ManualNotifyType;
    channels: ("email" | "sms")[];
  };

  const { data, error } = await supabase
    .from("appointments")
    .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const appt = data as AppointmentWithRelations;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (body.type === "intake") {
    // Intake doesn't use manage URL, uses intake URL
    const intakeUrl = `${appUrl}/appointments/${appt.location.slug}/intake?appt=${appt.id}`;
    await sendEmail("intake", appt, { intakeUrl });
    return NextResponse.json({ ok: true });
  }

  // For all other types, generate a fresh manage token
  const token = await createAppointmentToken(supabase, appt.id, appt.start_at);
  const manageUrl = `${appUrl}/manage/${token}`;

  await dispatch(supabase, body.type, appt, {
    channels: body.channels,
    manageUrl,
  });

  return NextResponse.json({ ok: true });
}
