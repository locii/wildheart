import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any;
type Ctx = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id: menu_id, itemId } = await params;
  const body = await req.json();
  const { data, error } = await db()
    .from("menu_items")
    .update(body)
    .eq("id", itemId)
    .eq("menu_id", menu_id)
    .select(`*, article:article_id(id,slug,title), appointment_type:appointment_type_id(id,name)`)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id: menu_id, itemId } = await params;
  const { error } = await db()
    .from("menu_items")
    .delete()
    .eq("id", itemId)
    .eq("menu_id", menu_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
