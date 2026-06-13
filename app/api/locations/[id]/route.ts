import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceClient();
  const body = await req.json() as Partial<{ name: string; timezone: string; color: string | null; address: string | null; description: string | null; is_active: boolean }>;
  const payload: Record<string, unknown> = {};
  if (body.name        !== undefined) payload.name        = body.name;
  if (body.timezone    !== undefined) payload.timezone    = body.timezone;
  if (body.color       !== undefined) payload.color       = body.color;
  if (body.address     !== undefined) payload.address     = body.address;
  if (body.description !== undefined) payload.description = body.description;
  if (body.is_active   !== undefined) payload.is_active   = body.is_active;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("locations") as any)
    .update(payload).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ location: data });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("locations") as any).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
