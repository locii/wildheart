import { createServiceClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServiceClient();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      client:clients(*),
      location:locations(*),
      type:appointment_types(*)
    `)
    .is("cancelled_at", null)
    .gte("start_at", todayStart.toISOString())
    .lte("start_at", todayEnd.toISOString())
    .order("start_at");

  const typed = (appointments ?? []) as unknown as AppointmentWithRelations[];
  const brunswick = typed.filter((a) => a.location.slug === "brunswick");
  const lorne = typed.filter((a) => a.location.slug === "lorne");

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Today</h1>
          <p className="text-sm text-gray-500">{format(now, "EEEE d MMMM yyyy")}</p>
        </div>
        <Link
          href="/admin/appointments/new"
          className="hidden md:inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg"
        >
          + New appointment
        </Link>
      </div>

      {typed.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No appointments today</p>
      ) : (
        <div className="space-y-6">
          {brunswick.length > 0 && (
            <LocationSection location="Brunswick" appointments={brunswick} />
          )}
          {lorne.length > 0 && (
            <LocationSection location="Lorne" appointments={lorne} />
          )}
        </div>
      )}
    </div>
  );
}

function LocationSection({
  location,
  appointments,
}: {
  location: string;
  appointments: AppointmentWithRelations[];
}) {
  return (
    <section>
      <div className="flex items-center gap-1.5 mb-2.5">
        <MapPin className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {location}
        </span>
        <span className="text-xs text-gray-400">· {appointments.length} appt{appointments.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-2">
        {appointments.map((appt) => (
          <AppointmentRow key={appt.id} appointment={appt} />
        ))}
      </div>
    </section>
  );
}

function AppointmentRow({ appointment: a }: { appointment: AppointmentWithRelations }) {
  const start = toZonedTime(new Date(a.start_at), a.timezone);
  const end = toZonedTime(new Date(a.end_at), a.timezone);
  const now = new Date();
  const isNow = new Date(a.start_at) <= now && new Date(a.end_at) > now;

  return (
    <Link
      href={`/admin/appointments/${a.id}`}
      className="block bg-white border rounded-xl p-4 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">
            {a.client.first_name} {a.client.last_name}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{a.type.name}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-medium tabular-nums">
            {format(start, "h:mm")}–{format(end, "h:mm a")}
          </div>
          {isNow && (
            <Badge variant="outline" className="text-[10px] mt-0.5 border-green-300 text-green-700">
              Now
            </Badge>
          )}
        </div>
      </div>
      {a.type.price > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">${a.type.price}</span>
          {a.paid ? (
            <Badge variant="outline" className="text-[10px] border-green-300 text-green-700">Paid</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">Unpaid</Badge>
          )}
        </div>
      )}
    </Link>
  );
}
