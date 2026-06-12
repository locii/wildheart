import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any;
type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id: menu_id } = await params;
  const body = await req.json();

  // Assign next position
  const { data: existing } = await db()
    .from("menu_items")
    .select("position")
    .eq("menu_id", menu_id)
    .is("parent_id", body.parent_id ?? null)
    .order("position", { ascending: false })
    .limit(1);

  const position = (existing?.[0]?.position ?? -1) + 1;

  const { data, error } = await db()
    .from("menu_items")
    .insert({ ...body, menu_id, position })
    .select(`*, article:article_id(id,slug,title), appointment_type:appointment_type_id(id,name)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}

/** PUT replaces positions for a set of items: [{ id, position }] */
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id: menu_id } = await params;
  const { positions } = await req.json() as { positions: { id: string; position: number }[] };

  await Promise.all(
    positions.map(({ id, position }) =>
      db().from("menu_items").update({ position }).eq("id", id).eq("menu_id", menu_id)
    )
  );

  return NextResponse.json({ ok: true });
}
