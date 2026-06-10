import { subDays } from "date-fns";

export interface ImportRow {
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  last_appointment_at: string | null;
}

export interface ParseResult {
  rows: ImportRow[];
  errors: string[];
}

/**
 * Parse a Squarespace CSV export.
 * Expected columns: First Name, Last Name, Phone, Email, Days Since Last Appointment
 */
export function parseSquarespaceCSV(csv: string): ParseResult {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], errors: ["CSV has no data rows"] };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));

  const firstNameIdx = findHeader(headers, ["first name", "firstname"]);
  const lastNameIdx = findHeader(headers, ["last name", "lastname"]);
  const phoneIdx = findHeader(headers, ["phone", "mobile", "phone number"]);
  const emailIdx = findHeader(headers, ["email", "email address"]);
  const daysIdx = findHeader(headers, ["days since last appointment", "days since last appt", "days"]);

  if (firstNameIdx === -1 || lastNameIdx === -1 || emailIdx === -1) {
    return { rows: [], errors: ["Missing required columns: First Name, Last Name, Email"] };
  }

  const rows: ImportRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length === 0 || cols.every((c) => !c.trim())) continue;

    const email = cols[emailIdx]?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      errors.push(`Row ${i + 1}: invalid or missing email`);
      continue;
    }

    const daysSince = daysIdx !== -1 ? parseInt(cols[daysIdx]?.trim() ?? "", 10) : NaN;
    const last_appointment_at = !isNaN(daysSince) && daysSince >= 0
      ? subDays(new Date(), daysSince).toISOString()
      : null;

    rows.push({
      first_name: cols[firstNameIdx]?.trim() ?? "",
      last_name: cols[lastNameIdx]?.trim() ?? "",
      phone: phoneIdx !== -1 ? (cols[phoneIdx]?.trim() || null) : null,
      email,
      last_appointment_at,
    });
  }

  return { rows, errors };
}

function findHeader(headers: string[], candidates: string[]): number {
  for (const c of candidates) {
    const idx = headers.indexOf(c);
    if (idx !== -1) return idx;
  }
  return -1;
}

// Simple CSV parser that handles quoted fields
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
