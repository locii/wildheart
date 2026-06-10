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
  type: { name: string; price: number };
  location: { name: string };
}

export async function fetchReport(
  supabase: SupabaseClient,
  params: ReportParams
): Promise<ReportData> {
  let query = supabase
    .from("appointments")
    .select("start_at, client_id, type:appointment_types(name, price), location:locations(name)")
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

  return { totalRevenue, totalCount, totalClients, avgValue, byType, byLocation, buckets };
}

function buildBuckets(
  rows: ApptRow[],
  period: ReportPeriod,
  from: string,
  to: string
): ReportBucket[] {
  const bucketMap = new Map<string, { revenue: number; count: number }>();

  for (const r of rows) {
    const d = new Date(r.start_at);
    let label: string;
    if (period === "week") {
      // Day label within week
      label = d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
    } else if (period === "month") {
      // Week number within month
      const weekOfMonth = Math.ceil(d.getDate() / 7);
      label = `Wk ${weekOfMonth}`;
    } else {
      // year / fy — monthly buckets
      // Month label (used for both year and financial year)
      label = d.toLocaleDateString("en-AU", { month: "short" });
    }
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
