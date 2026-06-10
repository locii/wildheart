import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchReport, type ReportPeriod } from "@/lib/reports";
import {
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
} from "date-fns";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = req.nextUrl;

  const period = (searchParams.get("period") ?? "month") as ReportPeriod;
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
    default:
      from = startOfMonth(d);
      to = endOfMonth(d);
  }

  try {
    const data = await fetchReport(supabase, {
      period,
      from: from.toISOString(),
      to: to.toISOString(),
      locationId,
    });
    return NextResponse.json({ data, from: from.toISOString(), to: to.toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
