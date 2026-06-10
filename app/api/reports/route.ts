import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchReport, type ReportPeriod } from "@/lib/reports";
import {
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
} from "date-fns";

const VALID_PERIODS = new Set<ReportPeriod>(["week", "month", "year", "fy"]);

function startOfFinancialYear(d: Date): Date {
  // FY starts 1 Jul — if we're in Jul-Dec the FY started this calendar year; Jan-Jun it started last year
  const fyStartYear = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return new Date(fyStartYear, 6, 1);
}

function endOfFinancialYear(d: Date): Date {
  return endOfMonth(new Date(startOfFinancialYear(d).getFullYear() + 1, 5, 1));
}

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = req.nextUrl;

  const rawPeriod = searchParams.get("period") ?? "month";
  const period: ReportPeriod = VALID_PERIODS.has(rawPeriod as ReportPeriod)
    ? (rawPeriod as ReportPeriod)
    : "month";
  const anchor = searchParams.get("anchor") ?? new Date().toISOString();
  const locationId = searchParams.get("locationId") ?? undefined;
  const d = new Date(anchor);

  let from: Date;
  let to: Date;

  switch (period) {
    case "week":
      from = startOfWeek(d, { weekStartsOn: 1 });
      to = endOfWeek(d, { weekStartsOn: 1 });
      break;
    case "year":
      from = startOfYear(d);
      to = endOfYear(d);
      break;
    case "fy":
      from = startOfFinancialYear(d);
      to = endOfFinancialYear(d);
      break;
    default:
      from = startOfMonth(d);
      to = endOfMonth(d);
  }

  try {
    const [data, { count: allTimeSessions }, { count: allTimeClients }] = await Promise.all([
      fetchReport(supabase, { period, from: from.toISOString(), to: to.toISOString(), locationId }),
      supabase.from("appointments").select("id", { count: "exact", head: true }).is("cancelled_at", null),
      supabase.from("clients").select("id", { count: "exact", head: true }),
    ]);
    return NextResponse.json({
      data,
      from: from.toISOString(),
      to: to.toISOString(),
      allTimeSessions: allTimeSessions ?? 0,
      allTimeClients: allTimeClients ?? 0,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
