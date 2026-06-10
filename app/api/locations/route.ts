import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("locations").select("*").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ locations: data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json() as { name: string; slug: string; timezone?: string; color?: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("locations") as any)
    .insert({ name: body.name.trim(), slug: body.slug.trim(), timezone: body.timezone ?? "Australia/Melbourne", color: body.color ?? null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ location: data }, { status: 201 });
}
