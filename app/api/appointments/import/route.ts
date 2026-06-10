import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseSquarespaceAppointmentCSV } from "@/lib/import-appointments";
import type { Location, AppointmentType } from "@/lib/supabase/types";

// Allow up to 5 minutes for large imports on Vercel Pro+
export const maxDuration = 300;

type Mappings = {
  types: Record<string, string | null>;      // csvName → typeId | null (skip)
  locations: Record<string, string | null>;  // csvSlug → locationId | null (skip)
};

type ClientRow = { id: string; email: string; last_appointment_at: string | null };

const CHUNK = 200;

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

  const emailList   = [...new Set(rows.map(r => r.email.toLowerCase()))];
  const startAtList = [...new Set(rows.map(r => r.startAt))];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: clientRows }, { data: existingApptRows }] = await Promise.all([
    (supabase.from("clients") as any).select("id, email").in("email", emailList),
    (supabase.from("appointments") as any).select("client_id, location_id, start_at").in("start_at", startAtList),
  ]) as [{ data: ClientRow[] | null }, { data: { client_id: string; location_id: string; start_at: string }[] | null }];

  const clientIdByEmail = new Map(
    (clientRows ?? []).map(c => [c.email.toLowerCase(), c.id]),
  );
  // Deduplicate by client+time AND by location+time (guards against the no_overlap exclusion constraint)
  const existingByClientTime = new Set(
    (existingApptRows ?? []).map(a => `${a.client_id}::${a.start_at}`),
  );
  const existingByLocationTime = new Set(
    (existingApptRows ?? []).map(a => `${a.location_id}::${a.start_at}`),
  );

  const previewData = rows.map((row) => {
    let location = locations.find((l) => l.slug === row.locationSlug);
    if (!location) {
      const mapped = mappings.locations[row.locationSlug];
      if (mapped) location = locations.find((l) => l.id === mapped);
    }
    const locationSkipped = !location && mappings.locations[row.locationSlug] === null;

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
    const alreadyExists =
      (!!clientId && existingByClientTime.has(`${clientId}::${row.startAt}`)) ||
      (!!location && existingByLocationTime.has(`${location.id}::${row.startAt}`));

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

  // ─── Stream bulk import ───────────────────────────────────────────────────
  const encoder = new TextEncoder();
  let imported = 0;
  const importErrors: string[] = [...parseErrors];
  const skippedCount = skipped.length;
  const total = toImport.length;

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        // ── Phase 1: resolve all clients ──────────────────────────────────
        // Compute the latest non-cancelled startAt and a representative row per email
        const maxStartAtByEmail = new Map<string, string>();
        const repRowByEmail = new Map<string, (typeof toImport)[0]["row"]>();
        for (const { row } of toImport) {
          const email = row.email.toLowerCase();
          if (!repRowByEmail.has(email)) repRowByEmail.set(email, row);
          if (!row.cancelledAt) {
            const cur = maxStartAtByEmail.get(email);
            if (!cur || row.startAt > cur) maxStartAtByEmail.set(email, row.startAt);
          }
        }

        const allEmails = [...repRowByEmail.keys()];

        // Fetch existing clients in bulk (chunk to respect Supabase IN limits)
        const clientMap = new Map<string, ClientRow>();
        for (let i = 0; i < allEmails.length; i += 500) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = await (supabase.from("clients") as any)
            .select("id, email, last_appointment_at")
            .in("email", allEmails.slice(i, i + 500)) as { data: ClientRow[] | null };
          (data ?? []).forEach(c => clientMap.set(c.email.toLowerCase(), c));
        }

        // Bulk insert missing clients in chunks
        const missingEmails = allEmails.filter(e => !clientMap.has(e));
        for (let i = 0; i < missingEmails.length; i += CHUNK) {
          const batch = missingEmails.slice(i, i + CHUNK).map(email => {
            const row = repRowByEmail.get(email)!;
            return {
              first_name: row.firstName,
              last_name:  row.lastName,
              phone:      row.phone,
              email,
              imported_from: "squarespace",
              last_appointment_at: maxStartAtByEmail.get(email) ?? null,
            };
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: inserted, error: clientErr } = await (supabase.from("clients") as any)
            .insert(batch).select("id, email, last_appointment_at") as { data: ClientRow[] | null; error: { message: string } | null };
          if (clientErr) {
            importErrors.push(`Failed to insert clients: ${clientErr.message}`);
          } else {
            (inserted ?? []).forEach(c => clientMap.set(c.email.toLowerCase(), c));
          }
        }

        // ── Phase 2: bulk insert appointments in chunks ───────────────────
        for (let i = 0; i < toImport.length; i += CHUNK) {
          const chunk = toImport.slice(i, i + CHUNK);
          const appts = chunk
            .map(({ row, locationId, typeId }) => {
              const client = clientMap.get(row.email.toLowerCase());
              if (!client) return null;
              return {
                client_id:    client.id,
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
              };
            })
            .filter(Boolean);

          if (appts.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: insertedAppts, error: apptErr } = await (supabase.from("appointments") as any)
              .insert(appts).select("id") as { data: { id: string }[] | null; error: { message: string } | null };
            if (apptErr) {
              // Batch hit a conflict (e.g. no_overlap exclusion constraint) — fall back to one-by-one
              for (const appt of appts) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: single, error: singleErr } = await (supabase.from("appointments") as any)
                  .insert(appt).select("id").single() as { data: { id: string } | null; error: { message: string } | null };
                if (singleErr) {
                  if (!singleErr.message.includes("no_overlap") && !singleErr.message.includes("exclusion")) {
                    importErrors.push(singleErr.message);
                  }
                } else if (single) {
                  imported += 1;
                }
              }
            } else {
              imported += (insertedAppts ?? []).length;
            }
          }

          emit({ progress: Math.min(i + CHUNK, total), total });
        }

        // ── Phase 3: update last_appointment_at for existing clients ──────
        const clientUpdates: Promise<unknown>[] = [];
        for (const [email, latestAt] of maxStartAtByEmail) {
          const client = clientMap.get(email);
          if (!client || !latestAt) continue;
          if (!client.last_appointment_at || client.last_appointment_at < latestAt) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clientUpdates.push(
              (supabase.from("clients") as any)
                .update({ last_appointment_at: latestAt })
                .eq("id", client.id),
            );
          }
        }
        for (let i = 0; i < clientUpdates.length; i += 50) {
          await Promise.all(clientUpdates.slice(i, i + 50));
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
