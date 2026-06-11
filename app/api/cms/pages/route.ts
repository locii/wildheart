import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any;

export async function GET() {
  const { data, error } = await db()
    .from("pages")
    .select("slug, title, meta_description, updated_at")
    .order("slug");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pages: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { slug: string; title: string; content?: string; meta_description?: string };
  const { data, error } = await db()
    .from("pages")
    .insert({ ...body, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ page: data }, { status: 201 });
}
