import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseSquarespaceCSV } from "@/lib/import";
import type { Client } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json() as { csv: string; confirm?: boolean };

  const { rows, errors } = parseSquarespaceCSV(body.csv);
  if (rows.length === 0) {
    return NextResponse.json({ errors, rows: [], imported: 0, skipped: 0 });
  }

  // Check which emails already exist
  const emails = rows.map((r) => r.email);
  const { data: existing } = await supabase
    .from("clients")
    .select("email")
    .in("email", emails);

  const existingEmails = new Set((existing ?? []).map((c: Pick<Client, "email">) => c.email.toLowerCase()));

  const toImport = rows.filter((r) => !existingEmails.has(r.email));
  const skipped = rows.filter((r) => existingEmails.has(r.email));

  if (!body.confirm) {
    // Preview mode — return what would happen without inserting
    return NextResponse.json({
      preview: true,
      toImport,
      skipped,
      parseErrors: errors,
    });
  }

  // Confirm mode — insert new clients
  let imported = 0;
  const importErrors: string[] = [...errors];

  for (const row of toImport) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("clients") as any).insert({
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
      email: row.email,
      last_appointment_at: row.last_appointment_at,
      imported_from: "squarespace",
    });
    if (error) {
      importErrors.push(`Failed to import ${row.email}: ${error.message}`);
    } else {
      imported++;
    }
  }

  return NextResponse.json({ imported, skipped: skipped.length, errors: importErrors });
}
