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

  // Bulk duplicate detection — check per-client, not just per-time
  const emailList  = [...new Set(rows.map(r => r.email.toLowerCase()))];
  const startAtList = [...new Set(rows.map(r => r.startAt))];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: clientRows }, { data: existingApptRows }] = await Promise.all([
    (supabase.from("clients") as any).select("id, email").in("email", emailList),
    (supabase.from("appointments") as any).select("client_id, start_at").in("start_at", startAtList),
  ]) as [{ data: { id: string; email: string }[] | null }, { data: { client_id: string; start_at: string }[] | null }];

  const clientIdByEmail = new Map(
    (clientRows ?? []).map(c => [c.email.toLowerCase(), c.id]),
  );
  // Key format: "clientId::startAt"
  const existingSet = new Set(
    (existingApptRows ?? []).map(a => `${a.client_id}::${a.start_at}`),
  );

  const previewData = rows.map((row) => {
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

    const clientId = clientIdByEmail.get(row.email.toLowerCase());
    const alreadyExists = !!clientId && existingSet.has(`${clientId}::${row.startAt}`);

    return {
      row,
      locationId: location?.id,
      typeId: type?.id,
      alreadyExists,
      intentionallySkipped,
      issues,
      canImport: !!location && !!type && !alreadyExists,
    };
  });

  const toImport = previewData.filter((p) => p.canImport);
  const skipped  = previewData.filter((p) => p.alreadyExists || p.intentionallySkipped);
  const invalid  = previewData.filter((p) => p.issues.length > 0 && !p.alreadyExists && !p.intentionallySkipped);

  const unknownTypes = [...new Set(
    previewData.filter((p) => p.issues.some((i) => i.startsWith("Unknown type"))).map((p) => p.row.typeName),
  )];
  const unknownLocations = [...new Set(
    previewData.filter((p) => p.issues.some((i) => i.startsWith("Unknown location"))).map((p) => p.row.locationSlug),
  )];

  if (!body.confirm) {
    return NextResponse.json({
      preview: true,
      toImport: toImport.map((p) => p.row),
      skipped: skipped.length,
      alreadyExists: previewData.filter((p) => p.alreadyExists).length,
      intentionallySkipped: previewData.filter((p) => p.intentionallySkipped).length,
      invalid: invalid.map((p) => ({ email: p.row.email, issues: p.issues })),
      parseErrors,
      unknownTypes,
      unknownLocations,
    });
  }

  // Stream progress back to client as NDJSON
  const encoder = new TextEncoder();
  let imported = 0;
  const importErrors: string[] = [...parseErrors];
  const skippedCount = skipped.length;

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        for (let idx = 0; idx < toImport.length; idx++) {
          const { row, locationId, typeId } = toImport[idx];

          let client: Client | null = null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: existingClient } = await (supabase.from("clients") as any)
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
              emit({ progress: idx + 1, total: toImport.length });
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

          emit({ progress: idx + 1, total: toImport.length });
        }
      } catch (err) {
        importErrors.push(`Unexpected error: ${String(err)}`);
      }

      emit({ done: true, imported, skipped: skippedCount, errors: importErrors });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
}
