import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  const body = await req.json() as Partial<{ name: string; slug: string | null; description: string | null; duration_minutes: number; price: number; is_active: boolean; is_public: boolean; sort_order: number }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("appointment_types") as any).update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ type: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceClient();
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("appointment_types") as any).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
