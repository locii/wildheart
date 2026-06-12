import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any;

export async function GET() {
  const { data, error } = await db().from("menus").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ menus: data });
}

export async function POST(req: NextRequest) {
  const { name, slug } = await req.json();
  const { data, error } = await db()
    .from("menus")
    .insert({ name, slug })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ menu: data }, { status: 201 });
}
