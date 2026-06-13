import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { toZonedTime, format } from "date-fns-tz";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

const TZ = "Australia/Melbourne";

function fmtLocal(iso: string): string {
  const zoned = toZonedTime(new Date(iso), TZ);
  return format(zoned, "yyyyMMdd'T'HHmmss", { timeZone: TZ });
}

function icalEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// RFC 5545 line folding at 75 octets
function fold(line: string): string {
  const encoder = new TextEncoder();
  let out = "";
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    if (bytes + charBytes > 75) {
      out += current + "\r\n ";
      current = char;
      bytes = 1 + charBytes; // 1 for the leading space
    } else {
      current += char;
      bytes += charBytes;
    }
  }
  return out + current;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const secret = process.env.ICAL_SECRET;

  if (!secret || token !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data, error } = await supabase
    .from("appointments")
    .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
    .is("cancelled_at", null)
    .gte("start_at", oneYearAgo.toISOString())
    .order("start_at")
    .limit(5000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const appointments = (data ?? []) as unknown as AppointmentWithRelations[];

  if (req.nextUrl.searchParams.get("debug") === "1") {
    return NextResponse.json({
      count: appointments.length,
      appointments: appointments.map((a) => ({
        id: a.id,
        start_at: a.start_at,
        end_at: a.end_at,
        cancelled_at: a.cancelled_at,
        client: a.client ? `${a.client.first_name} ${a.client.last_name}` : null,
        type: a.type?.name,
        location: a.location?.name,
      })),
    });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const domain = appUrl.replace(/https?:\/\//, "");
  const stampUtc = format(toZonedTime(new Date(), TZ), "yyyyMMdd'T'HHmmss'Z'", { timeZone: "UTC" });

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${domain}//Wildheart Appointments//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Wildheart Appointments",
    `X-WR-TIMEZONE:${TZ}`,
  ];

  for (const appt of appointments) {
    const clientName = `${appt.client.first_name} ${appt.client.last_name}`;
    const summary = `${clientName} - ${appt.type.name}`;
    const descParts = [
      `Client: ${clientName}`,
      `Type: ${appt.type.name}`,
      `Location: ${appt.location.name}`,
      appt.location.address ? `Address: ${appt.location.address}` : null,
      `Duration: ${appt.type.duration_minutes} min`,
    ].filter(Boolean).join("\\n");

    lines.push("BEGIN:VEVENT");
    lines.push(fold(`UID:${appt.id}@${domain}`));
    lines.push(`DTSTAMP:${stampUtc}`);
    lines.push(fold(`DTSTART;TZID=${TZ}:${fmtLocal(appt.start_at)}`));
    lines.push(fold(`DTEND;TZID=${TZ}:${fmtLocal(appt.end_at)}`));
    lines.push(fold(`SUMMARY:${icalEscape(summary)}`));
    lines.push(fold(`DESCRIPTION:${descParts}`));
    if (appt.location.address) {
      lines.push(fold(`LOCATION:${icalEscape(appt.location.address)}`));
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  const cal = lines.join("\r\n") + "\r\n";

  return new NextResponse(cal, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wildheart.ics"',
      "Cache-Control": "no-store",
    },
  });
}
