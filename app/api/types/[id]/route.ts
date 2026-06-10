import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const body = await req.json() as Partial<{ name: string; duration_minutes: number; price: number; is_active: boolean; sort_order: number }>;
  const { data, error } = await supabase
    .from("appointment_types")
    .update(body)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ type: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const { error } = await supabase.from("appointment_types").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
