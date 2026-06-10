import { parse as parseDate } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export interface AppointmentRow {
  squarespaceId: string;
  startAt: string;        // ISO UTC
  endAt: string;          // ISO UTC
  timezone: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
  typeName: string;
  locationSlug: string;
  price: number;
  paid: boolean;
  amountPaid: number;
  cancelledAt: string | null;
  scheduledBy: string;
  notes: string | null;
}

export interface AppointmentParseResult {
  rows: AppointmentRow[];
  errors: string[];
}

const LOCATION_MAP: Record<string, string> = {
  brunswick: "brunswick",
  lorne: "lorne",
};

/** Parse a Squarespace schedule CSV export (supports both old and new column layouts) */
export function parseSquarespaceAppointmentCSV(csv: string): AppointmentParseResult {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], errors: ["CSV has no data rows"] };

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const col = (name: string) => headers.indexOf(name);

  const idxStart     = col("start time");
  const idxEnd       = col("end time");
  const idxTimezone  = col("timezone");
  const idxFirst     = col("first name");
  const idxLast      = col("last name");
  const idxPhone     = col("phone");
  const idxEmail     = col("email");
  const idxType      = col("type");
  const idxCalendar  = col("calendar");
  const idxPrice     = col("appointment price");
  const idxPaid      = col("paid?");
  const idxAmtPaid   = col("amount paid online");
  const idxCanceled  = col("canceled");
  const idxDateCanceled = col("date canceled");
  const idxScheduledBy  = col("scheduled by");
  const idxNotes     = col("notes");
  const idxApptId    = col("appointment id");

  if (idxStart === -1 || idxEmail === -1 || idxType === -1) {
    return { rows: [], errors: ["Missing required columns: Start Time, Email, Type"] };
  }

  const rows: AppointmentRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const c = parseCSVLine(lines[i]);
    if (c.length === 0 || c.every((v) => !v.trim())) continue;

    const email = c[idxEmail]?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      errors.push(`Row ${i + 1}: invalid email`);
      continue;
    }

    const startRaw = c[idxStart]?.trim();
    const endRaw   = c[idxEnd]?.trim();
    const tz       = idxTimezone !== -1 ? (c[idxTimezone]?.trim() || "Australia/Melbourne") : "Australia/Melbourne";

    const startLocal = parseSQDate(startRaw);
    const endLocal   = parseSQDate(endRaw);
    if (!startLocal || !endLocal) {
      errors.push(`Row ${i + 1}: could not parse date "${startRaw}"`);
      continue;
    }

    const startAt = fromZonedTime(startLocal, tz).toISOString();
    const endAt   = fromZonedTime(endLocal, tz).toISOString();

    const calendarName = c[idxCalendar]?.trim().toLowerCase() ?? "";
    const locationSlug = LOCATION_MAP[calendarName] ?? calendarName;

    const phone = cleanPhone(c[idxPhone]?.trim());

    const canceledFlag = idxCanceled !== -1 ? c[idxCanceled]?.trim().toLowerCase() : "";
    const dateCanceled = idxDateCanceled !== -1 ? c[idxDateCanceled]?.trim() : "";
    const cancelledAt = (canceledFlag === "yes" || dateCanceled)
      ? (dateCanceled ? new Date(dateCanceled).toISOString() : startAt)
      : null;

    rows.push({
      squarespaceId: c[idxApptId]?.trim() ?? "",
      startAt,
      endAt,
      timezone: tz,
      firstName: c[idxFirst]?.trim() ?? "",
      lastName:  c[idxLast]?.trim() ?? "",
      phone,
      email,
      typeName:     c[idxType]?.trim() ?? "",
      locationSlug,
      price:      parseFloat(c[idxPrice]?.trim() ?? "0") || 0,
      paid:       c[idxPaid]?.trim().toLowerCase() === "yes",
      amountPaid: parseFloat(c[idxAmtPaid]?.trim() ?? "0") || 0,
      cancelledAt,
      scheduledBy: c[idxScheduledBy]?.trim() || "squarespace-import",
      notes:      c[idxNotes]?.trim() || null,
    });
  }

  return { rows, errors };
}

/** Parse "June 4, 2026 12:00 pm" → Date in local time */
function parseSQDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  // Try "June 4, 2026 12:00 pm"
  try {
    return parseDate(raw, "MMMM d, yyyy h:mm aa", new Date());
  } catch {}
  // Try "June 4, 2026 12:00:00 pm" (with seconds)
  try {
    return parseDate(raw, "MMMM d, yyyy h:mm:ss aa", new Date());
  } catch {}
  return null;
}

function cleanPhone(raw: string | undefined): string | null {
  if (!raw) return null;
  // Remove leading quote from Squarespace's '+61 format
  const cleaned = raw.replace(/^'+/, "+").replace(/\D/g, "");
  return cleaned || null;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
