import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("intake_questions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ questions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const { appointmentId, data: formData, skipped } = await req.json();

  if (!appointmentId) return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("intake_forms") as any)
    .update({
      completed_at: skipped ? null : new Date().toISOString(),
      data: skipped ? null : formData,
    })
    .eq("appointment_id", appointmentId);

  return NextResponse.json({ ok: true });
}
