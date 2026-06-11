import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any;

export async function GET() {
  const { data, error } = await db().from("sidebar_blocks").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sidebar_blocks: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name: string;
    image_url?: string;
    button_label?: string;
    button_url?: string;
    body?: string;
  };
  const { data, error } = await db()
    .from("sidebar_blocks")
    .insert({ ...body, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sidebar_block: data }, { status: 201 });
}
