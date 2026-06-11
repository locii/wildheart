import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

function fmtDt(iso: string): string {
  // iCal UTC format: YYYYMMDDTHHMMSSZ
  return iso.replace(/[-:]/g, "").replace(/\.\d+/, "").replace(" ", "T");
}

function escape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function fold(line: string): string {
  // RFC 5545: lines longer than 75 octets should be folded
  const out: string[] = [];
  while (line.length > 75) {
    out.push(line.slice(0, 75));
    line = " " + line.slice(75);
  }
  out.push(line);
  return out.join("\r\n");
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const secret = process.env.ICAL_SECRET;

  if (!secret || token !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
    .is("cancelled_at", null)
    .order("start_at");

  if (error) return new NextResponse("Database error", { status: 500 });

  const appointments = (data ?? []) as unknown as AppointmentWithRelations[];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://wildheartpsychotherapy.com.au";
  const domain = appUrl.replace(/https?:\/\//, "");
  const now = fmtDt(new Date().toISOString());

  const events = appointments.map((appt) => {
    const clientName = `${appt.client.first_name} ${appt.client.last_name}`;
    const summary = `${clientName} – ${appt.type.name}`;
    const description = [
      `Client: ${clientName}`,
      `Type: ${appt.type.name}`,
      `Location: ${appt.location.name}`,
      appt.location.address ? `Address: ${appt.location.address}` : null,
      `Duration: ${appt.type.duration_minutes} min`,
    ]
      .filter(Boolean)
      .join("\\n");

    return [
      "BEGIN:VEVENT",
      fold(`UID:${appt.id}@${domain}`),
      fold(`DTSTAMP:${now}`),
      fold(`DTSTART:${fmtDt(appt.start_at)}`),
      fold(`DTEND:${fmtDt(appt.end_at)}`),
      fold(`SUMMARY:${escape(summary)}`),
      fold(`DESCRIPTION:${description}`),
      appt.location.address ? fold(`LOCATION:${escape(appt.location.address)}`) : null,
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\r\n");
  });

  const cal = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${domain}//Wildheart Appointments//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Wildheart Appointments",
    "X-WR-TIMEZONE:Australia/Melbourne",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(cal, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wildheart.ics"',
      "Cache-Control": "no-store",
    },
  });
}
