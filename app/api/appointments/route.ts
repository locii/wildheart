import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createAppointmentToken, buildManageUrl } from "@/lib/tokens";
import type { Client, Location, AppointmentType, AppointmentWithRelations } from "@/lib/supabase/types";
import { dispatch } from "@/lib/notifications/dispatch";
import { sendEmail } from "@/lib/notifications/email";
import { sendAdminSms } from "@/lib/notifications/sms";
import { formatApptDateTime } from "@/lib/notifications/format";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = req.nextUrl;

  const locationId = searchParams.get("locationId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q")?.trim() ?? "";
  const limit  = Math.min(parseInt(searchParams.get("limit")  ?? "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const paginate = searchParams.has("limit");

  const typeNames = searchParams.get("typeNames"); // comma-separated type names to include

  // Resolve matching client IDs for search query
  let clientIdFilter: string[] | null = null;
  if (q) {
    const term = `%${q}%`;
    const { data: matchedClients } = await supabase
      .from("clients")
      .select("id")
      .or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`);
    clientIdFilter = (matchedClients ?? []).map((c: { id: string }) => c.id);
  }

  // Resolve type IDs for type-name filter
  let typeIdFilter: string[] | null = null;
  if (typeNames) {
    const names = typeNames.split(",").map(n => n.trim()).filter(Boolean);
    const { data: matchedTypes } = await supabase
      .from("appointment_types")
      .select("id")
      .in("name", names);
    typeIdFilter = (matchedTypes ?? []).map((t: { id: string }) => t.id);
  }

  const ascending = searchParams.get("order") !== "desc";

  let query = supabase
    .from("appointments")
    .select(`*, client:clients(*), location:locations(*), type:appointment_types(*)`, paginate ? { count: "exact" } : undefined)
    .is("cancelled_at", null)
    .order("start_at", { ascending });

  if (locationId) query = query.eq("location_id", locationId);
  if (from) query = query.gte("start_at", from);
  if (to) query = query.lte("start_at", to);
  if (clientIdFilter !== null) {
    if (clientIdFilter.length === 0) return NextResponse.json({ appointments: [], total: 0 });
    query = query.in("client_id", clientIdFilter);
  }
  if (typeIdFilter !== null) {
    if (typeIdFilter.length === 0) return NextResponse.json({ appointments: [], total: 0 });
    query = query.in("type_id", typeIdFilter);
  }
  if (paginate) query = (query as typeof query).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointments: data, total: count ?? undefined });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();

  const { locationSlug, typeId, start, client: clientData, source = "self-book", scheduledBy = "client-self", quiet = false } = body as {
    locationSlug: string;
    typeId: string;
    start: string;
    client: { first_name: string; last_name: string; phone: string; email: string };
    source?: string;
    scheduledBy?: string;
    quiet?: boolean;
  };

  // Resolve location
  const { data: locData } = await supabase.from("locations").select("*");
  const location = ((locData ?? []) as Location[]).find((l) => l.slug === locationSlug);
  if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });

  // Resolve appointment type
  const { data: typeData } = await supabase
    .from("appointment_types")
    .select("*")
    .eq("id", typeId)
    .maybeSingle();
  const apptType = typeData as AppointmentType | null;
  if (!apptType) return NextResponse.json({ error: "Type not found" }, { status: 404 });

  const end = new Date(new Date(start).getTime() + apptType.duration_minutes * 60 * 1000).toISOString();

  // Find or create client
  let client: Client | null = null;
  let isNewClient = false;

  const { data: existing } = await supabase
    .from("clients")
    .select("*")
    .ilike("email", clientData.email)
    .maybeSingle();

  if (existing) {
    client = existing as Client;
    // Update phone if missing
    if (!client.phone && clientData.phone) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("clients") as any)
        .update({ phone: clientData.phone })
        .eq("id", client.id);
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created } = await (supabase.from("clients") as any)
      .insert({
        first_name: clientData.first_name,
        last_name: clientData.last_name,
        phone: clientData.phone || null,
        email: clientData.email.toLowerCase(),
      })
      .select()
      .single();
    client = created as Client;
    isNewClient = true;
  }

  if (!client) return NextResponse.json({ error: "Failed to create client" }, { status: 500 });

  // Create appointment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: appt, error: apptError } = await (supabase.from("appointments") as any)
    .insert({
      client_id: client.id,
      location_id: location.id,
      type_id: apptType.id,
      start_at: start,
      end_at: end,
      timezone: location.timezone,
      source,
      scheduled_by: scheduledBy,
    })
    .select()
    .single();

  if (apptError) {
    // Unique constraint violation = slot already taken
    if (apptError.code === "23P01") {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
    }
    return NextResponse.json({ error: apptError.message }, { status: 500 });
  }

  // Generate manage token
  const token = await createAppointmentToken(supabase, appt.id, start);

  // Create intake form record for new clients
  if (isNewClient) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("intake_forms") as any).insert({
      client_id: client.id,
      appointment_id: appt.id,
    });
  }

  // Update client's last_appointment_at
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("clients") as any)
    .update({ last_appointment_at: start })
    .eq("id", client.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const manageUrl = buildManageUrl(token);
  const intakeUrl = isNewClient ? `${appUrl}/appointments/${locationSlug}/intake?appt=${appt.id}` : undefined;

  // Build full appointment with relations for notification dispatch
  const apptWithRelations: AppointmentWithRelations = {
    ...appt,
    client,
    location,
    type: apptType,
  };

  if (!quiet) {
    // Auto-send booking confirmation (fire and forget — don't block the response)
    dispatch(supabase, "booking", apptWithRelations, {
      channels: ["email", ...(client.phone ? ["sms" as const] : [])],
      manageUrl,
      intakeUrl,
    }).catch(console.error);

    // Send intake invite directly (intake is not logged in notifications table)
    if (isNewClient && intakeUrl) {
      sendEmail("intake", apptWithRelations, { intakeUrl }).catch(console.error);
    }
  }

  // Notify admin when a client self-books via the public flow
  if (source === "self-book" || source === "embed") {
    const { date, time } = formatApptDateTime(appt.start_at, appt.end_at, location.timezone);
    const clientName = `${client.first_name} ${client.last_name}`;
    sendAdminSms(
      `New booking: ${clientName} – ${apptType.name} on ${date} at ${time}`
    ).catch(console.error);
  }

  return NextResponse.json({ appointment: appt, token, isNewClient });
}
