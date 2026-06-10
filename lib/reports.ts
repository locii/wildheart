import type { SupabaseClient } from "@supabase/supabase-js";

export type ReportPeriod = "week" | "month" | "year" | "fy";

export interface ReportBucket {
  label: string;
  revenue: number;
  count: number;
  avgValue: number;
}

export interface ReportData {
  totalRevenue: number;
  totalCount: number;
  totalClients: number;
  avgValue: number;
  byType: { name: string; revenue: number; count: number }[];
  byLocation: { name: string; revenue: number; count: number }[];
  buckets: ReportBucket[];
  newVsReturning: { label: string; newClients: number; returning: number }[];
  topClients: { name: string; sessions: number; revenue: number }[];
}

interface ReportParams {
  period: ReportPeriod;
  from: string;  // ISO date
  to: string;    // ISO date
  locationId?: string;
}

interface ApptRow {
  start_at: string;
  client_id: string;
  client: { first_name: string; last_name: string } | null;
  type: { name: string; price: number };
  location: { name: string };
}

export async function fetchReport(
  supabase: SupabaseClient,
  params: ReportParams
): Promise<ReportData> {
  let query = supabase
    .from("appointments")
    .select("start_at, client_id, client:clients(first_name, last_name), type:appointment_types(name, price), location:locations(name)")
    .gte("start_at", params.from)
    .lte("start_at", params.to)
    .is("cancelled_at", null);

  if (params.locationId) {
    query = query.eq("location_id", params.locationId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as unknown as ApptRow[];

  const totalRevenue = rows.reduce((s, r) => s + (r.type?.price ?? 0), 0);
  const totalCount = rows.length;
  const totalClients = new Set(rows.map(r => r.client_id)).size;
  const avgValue = totalCount > 0 ? totalRevenue / totalCount : 0;

  // By type
  const typeMap = new Map<string, { revenue: number; count: number }>();
  for (const r of rows) {
    const name = r.type?.name ?? "Unknown";
    const price = r.type?.price ?? 0;
    const existing = typeMap.get(name) ?? { revenue: 0, count: 0 };
    typeMap.set(name, { revenue: existing.revenue + price, count: existing.count + 1 });
  }
  const byType = Array.from(typeMap.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.revenue - a.revenue);

  // By location
  const locMap = new Map<string, { revenue: number; count: number }>();
  for (const r of rows) {
    const name = r.location?.name ?? "Unknown";
    const price = r.type?.price ?? 0;
    const existing = locMap.get(name) ?? { revenue: 0, count: 0 };
    locMap.set(name, { revenue: existing.revenue + price, count: existing.count + 1 });
  }
  const byLocation = Array.from(locMap.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.revenue - a.revenue);

  // Time buckets
  const buckets = buildBuckets(rows, params.period, params.from, params.to);

  // New vs returning — a client is "new" if they had no appointment before this period
  const clientIds = [...new Set(rows.map(r => r.client_id))];
  let returningClientIds = new Set<string>();
  if (clientIds.length > 0) {
    for (let i = 0; i < clientIds.length; i += 500) {
      const { data: prior } = await supabase
        .from("appointments")
        .select("client_id")
        .in("client_id", clientIds.slice(i, i + 500))
        .is("cancelled_at", null)
        .lt("start_at", params.from);
      for (const r of (prior ?? [])) returningClientIds.add(r.client_id);
    }
  }

  // For new clients, track their first appearance (bucket) in this period
  const newClientFirstAppt = new Map<string, string>();
  for (const r of rows) {
    if (!returningClientIds.has(r.client_id)) {
      const cur = newClientFirstAppt.get(r.client_id);
      if (!cur || r.start_at < cur) newClientFirstAppt.set(r.client_id, r.start_at);
    }
  }

  const nvBucketMap = new Map<string, { newClients: number; returning: number }>();
  for (const r of rows) {
    const label = bucketLabel(r.start_at, params.period);
    const b = nvBucketMap.get(label) ?? { newClients: 0, returning: 0 };
    if (!returningClientIds.has(r.client_id) && newClientFirstAppt.get(r.client_id) === r.start_at) {
      // Count each new client exactly once, in their first bucket
      b.newClients += 1;
    }
    nvBucketMap.set(label, b);
  }
  // Returning = unique returning clients per bucket
  const returningPerBucket = new Map<string, Set<string>>();
  for (const r of rows) {
    if (returningClientIds.has(r.client_id)) {
      const label = bucketLabel(r.start_at, params.period);
      const s = returningPerBucket.get(label) ?? new Set();
      s.add(r.client_id);
      returningPerBucket.set(label, s);
    }
  }
  for (const [label, clients] of returningPerBucket) {
    const b = nvBucketMap.get(label) ?? { newClients: 0, returning: 0 };
    b.returning = clients.size;
    nvBucketMap.set(label, b);
  }
  const newVsReturning = Array.from(nvBucketMap.entries()).map(([label, d]) => ({ label, ...d }));

  // Top clients — aggregate sessions + revenue per client for the period
  const clientAgg = new Map<string, { name: string; sessions: number; revenue: number }>();
  for (const r of rows) {
    const name = r.client
      ? `${r.client.first_name} ${r.client.last_name}`.trim()
      : r.client_id;
    const existing = clientAgg.get(r.client_id) ?? { name, sessions: 0, revenue: 0 };
    existing.sessions += 1;
    existing.revenue += r.type?.price ?? 0;
    clientAgg.set(r.client_id, existing);
  }
  const topClients = Array.from(clientAgg.values())
    .sort((a, b) => b.sessions - a.sessions || b.revenue - a.revenue)
    .slice(0, 10);

  return { totalRevenue, totalCount, totalClients, avgValue, byType, byLocation, buckets, newVsReturning, topClients };
}

function bucketLabel(startAt: string, period: ReportPeriod): string {
  const d = new Date(startAt);
  if (period === "week") {
    return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
  } else if (period === "month") {
    return `Wk ${Math.ceil(d.getDate() / 7)}`;
  } else {
    return d.toLocaleDateString("en-AU", { month: "short" });
  }
}

function buildBuckets(rows: ApptRow[], period: ReportPeriod, from: string, to: string): ReportBucket[] {
  const bucketMap = new Map<string, { revenue: number; count: number }>();
  for (const r of rows) {
    const label = bucketLabel(r.start_at, period);
    const existing = bucketMap.get(label) ?? { revenue: 0, count: 0 };
    bucketMap.set(label, {
      revenue: existing.revenue + (r.type?.price ?? 0),
      count: existing.count + 1,
    });
  }
  return Array.from(bucketMap.entries()).map(([label, d]) => ({
    label,
    revenue: d.revenue,
    count: d.count,
    avgValue: d.count > 0 ? d.revenue / d.count : 0,
  }));
}
