import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createServiceClient() as any;

export async function GET() {
  const { data, error } = await db()
    .from("articles")
    .select("id, slug, title, excerpt, external_url, published_at, updated_at")
    .order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    slug?: string;
    title: string;
    excerpt?: string;
    content?: string;
    external_url?: string;
    image_url?: string;
    published?: boolean;
    published_at?: string;
  };
  const { data, error } = await db()
    .from("articles")
    .insert({ ...body, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ article: data }, { status: 201 });
}
