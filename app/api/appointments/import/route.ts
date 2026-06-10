import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseSquarespaceAppointmentCSV } from "@/lib/import-appointments";
import type { Location, AppointmentType, Client } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json() as { csv: string; confirm?: boolean };

  const { rows, errors: parseErrors } = parseSquarespaceAppointmentCSV(body.csv);
  if (rows.length === 0) {
    return NextResponse.json({ parseErrors, rows: [], toImport: 0, skipped: 0 });
  }

  // Load locations and types for lookup
  const [{ data: locData }, { data: typeData }] = await Promise.all([
    supabase.from("locations").select("*"),
    supabase.from("appointment_types").select("*"),
  ]);
  const locations = (locData ?? []) as Location[];
  const types     = (typeData ?? []) as AppointmentType[];

  // Check which squarespace IDs already exist (via notes field hack — or check start_at + email)
  const preview = await Promise.all(rows.map(async (row) => {
    const location = locations.find((l) => l.slug === row.locationSlug);
    const type     = types.find((t) => t.name.toLowerCase() === row.typeName.toLowerCase());

    const issues: string[] = [];
    if (!location) issues.push(`Unknown location "${row.locationSlug}"`);
    if (!type)     issues.push(`Unknown type "${row.typeName}"`);

    // Check if appointment already exists (same start_at)
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("start_at", row.startAt)
      .maybeSingle();

    return {
      row,
      locationId: location?.id,
      typeId: type?.id,
      alreadyExists: !!existing,
      issues,
      canImport: !!location && !!type && !existing,
    };
  }));

  const toImport = preview.filter((p) => p.canImport);
  const skipped  = preview.filter((p) => p.alreadyExists);
  const invalid  = preview.filter((p) => p.issues.length > 0 && !p.alreadyExists);

  if (!body.confirm) {
    return NextResponse.json({
      preview: true,
      toImport: toImport.map((p) => p.row),
      skipped: skipped.length,
      invalid: invalid.map((p) => ({ email: p.row.email, issues: p.issues })),
      parseErrors,
    });
  }

  // Confirm — import
  let imported = 0;
  const importErrors: string[] = [...parseErrors];

  for (const { row, locationId, typeId } of toImport) {
    // Find or create client
    let client: Client | null = null;
    const { data: existingClient } = await supabase
      .from("clients")
      .select("*")
      .ilike("email", row.email)
      .maybeSingle();

    if (existingClient) {
      client = existingClient as Client;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newClient, error: clientErr } = await (supabase.from("clients") as any)
        .insert({
          first_name: row.firstName,
          last_name:  row.lastName,
          phone:      row.phone,
          email:      row.email,
          imported_from: "squarespace",
          last_appointment_at: row.startAt,
        })
        .select()
        .single();

      if (clientErr) {
        importErrors.push(`Failed to create client ${row.email}: ${clientErr.message}`);
        continue;
      }
      client = newClient as Client;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: apptErr } = await (supabase.from("appointments") as any).insert({
      client_id:    client!.id,
      location_id:  locationId,
      type_id:      typeId,
      start_at:     row.startAt,
      end_at:       row.endAt,
      timezone:     row.timezone,
      paid:         row.paid,
      amount_paid:  row.amountPaid,
      scheduled_by: row.scheduledBy,
      source:       "admin",
      cancelled_at: row.cancelledAt,
    });

    if (apptErr) {
      importErrors.push(`Failed to import ${row.email} at ${row.startAt}: ${apptErr.message}`);
    } else {
      imported++;
      // Update client's last_appointment_at if this is more recent
      if (!row.cancelledAt) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("clients") as any)
          .update({ last_appointment_at: row.startAt })
          .eq("id", client!.id)
          .lt("last_appointment_at", row.startAt);
      }
    }
  }

  return NextResponse.json({
    imported,
    skipped: skipped.length,
    errors: importErrors,
  });
}
