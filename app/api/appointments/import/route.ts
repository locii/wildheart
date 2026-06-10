import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseSquarespaceAppointmentCSV } from "@/lib/import-appointments";
import type { Location, AppointmentType, Client } from "@/lib/supabase/types";

type Mappings = {
  types: Record<string, string | null>;      // csvName → typeId | null (skip)
  locations: Record<string, string | null>;  // csvSlug → locationId | null (skip)
};

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json() as { csv: string; confirm?: boolean; mappings?: Mappings };
  const mappings: Mappings = body.mappings ?? { types: {}, locations: {} };

  const { rows, errors: parseErrors } = parseSquarespaceAppointmentCSV(body.csv);
  if (rows.length === 0) {
    return NextResponse.json({ parseErrors, rows: [], toImport: 0, skipped: 0 });
  }

  const [{ data: locData }, { data: typeData }] = await Promise.all([
    supabase.from("locations").select("*"),
    supabase.from("appointment_types").select("*"),
  ]);
  const locations = (locData ?? []) as Location[];
  const types     = (typeData ?? []) as AppointmentType[];

  const preview = await Promise.all(rows.map(async (row) => {
    // Resolve location: direct match → mapping → unknown
    let location = locations.find((l) => l.slug === row.locationSlug);
    if (!location) {
      const mapped = mappings.locations[row.locationSlug];
      if (mapped) location = locations.find((l) => l.id === mapped);
    }
    const locationSkipped = !location && mappings.locations[row.locationSlug] === null;

    // Resolve type: case-insensitive match → mapping → unknown
    let type = types.find((t) => t.name.toLowerCase() === row.typeName.toLowerCase());
    if (!type) {
      const mapped = mappings.types[row.typeName];
      if (mapped) type = types.find((t) => t.id === mapped);
    }
    const typeSkipped = !type && mappings.types[row.typeName] === null;

    const issues: string[] = [];
    if (!location && !locationSkipped) issues.push(`Unknown location "${row.locationSlug}"`);
    if (!type && !typeSkipped)         issues.push(`Unknown type "${row.typeName}"`);

    const intentionallySkipped = locationSkipped || typeSkipped;

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
      intentionallySkipped,
      issues,
      canImport: !!location && !!type && !existing,
    };
  }));

  const toImport  = preview.filter((p) => p.canImport);
  const skipped   = preview.filter((p) => p.alreadyExists || p.intentionallySkipped);
  const invalid   = preview.filter((p) => p.issues.length > 0 && !p.alreadyExists && !p.intentionallySkipped);

  // Collect unique unknowns to show in mapping UI
  const unknownTypes = [...new Set(
    preview.filter((p) => p.issues.some((i) => i.startsWith("Unknown type"))).map((p) => p.row.typeName),
  )];
  const unknownLocations = [...new Set(
    preview.filter((p) => p.issues.some((i) => i.startsWith("Unknown location"))).map((p) => p.row.locationSlug),
  )];

  if (!body.confirm) {
    return NextResponse.json({
      preview: true,
      toImport: toImport.map((p) => p.row),
      skipped: skipped.length,
      invalid: invalid.map((p) => ({ email: p.row.email, issues: p.issues })),
      parseErrors,
      unknownTypes,
      unknownLocations,
    });
  }

  // Confirm — import
  let imported = 0;
  const importErrors: string[] = [...parseErrors];

  for (const { row, locationId, typeId } of toImport) {
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
      if (!row.cancelledAt) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("clients") as any)
          .update({ last_appointment_at: row.startAt })
          .eq("id", client!.id)
          .lt("last_appointment_at", row.startAt);
      }
    }
  }

  return NextResponse.json({ imported, skipped: skipped.length, errors: importErrors });
}
