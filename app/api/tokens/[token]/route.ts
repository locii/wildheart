import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: tokenRow } = await supabase
    .from("appointment_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = tokenRow as any;
  if (!row) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  const isExpired = new Date(row.expires_at) < new Date();
  if (isExpired && process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }

  const { data } = await supabase
    .from("appointments")
    .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
    .eq("id", row.appointment_id)
    .maybeSingle();

  if (!data) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

  return NextResponse.json({ appointment: data as AppointmentWithRelations });
}
