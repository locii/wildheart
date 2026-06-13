import { createServiceClient } from "@/lib/supabase/server";
import { format, startOfDay, endOfDay, addDays, isToday, isTomorrow, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { AppointmentWithRelations } from "@/lib/supabase/types";
import { FailedNotificationsBanner, type FailedNotification } from "@/components/admin/FailedNotificationsBanner";

export const dynamic = "force-dynamic";

const TIMEZONE = "Australia/Melbourne";

export default async function DashboardPage() {
  const supabase = createServiceClient();

  const weekStart = startOfDay(new Date());
  const weekEnd = endOfDay(addDays(weekStart, 6));

  const sevenDaysAgo = subDays(weekStart, 7).toISOString();

  const [{ data }, { data: failedData }] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
      .is("cancelled_at", null)
      .gte("start_at", weekStart.toISOString())
      .lte("start_at", weekEnd.toISOString())
      .order("start_at"),
    supabase
      .from("notifications")
      .select("id, appointment_id, type, channel, error, created_at, appointment:appointments(start_at, client:clients(first_name, last_name))")
      .eq("status", "failed")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const appointments = (data ?? []) as unknown as AppointmentWithRelations[];
  const failedNotifications = (failedData ?? []) as unknown as FailedNotification[];

  // Group by calendar date in Melbourne timezone
  const grouped = new Map<string, AppointmentWithRelations[]>();
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    grouped.set(format(day, "yyyy-MM-dd"), []);
  }
  for (const appt of appointments) {
    const dateKey = format(toZonedTime(new Date(appt.start_at), TIMEZONE), "yyyy-MM-dd");
    if (grouped.has(dateKey)) grouped.get(dateKey)!.push(appt);
  }

  const totalWeek = appointments.length;

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">This week</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {format(weekStart, "d MMM")}–{format(weekEnd, "d MMM yyyy")} · {totalWeek} appointment{totalWeek !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/appointments/new"
          className="hidden md:inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-3 py-2 rounded-lg"
        >
          + New Appointment
        </Link>
      </div>

      <FailedNotificationsBanner initial={failedNotifications} />

      <div className="space-y-1">
        {Array.from(grouped.entries()).map(([dateKey, appts]) => (
          <DaySection key={dateKey} dateKey={dateKey} appointments={appts} />
        ))}
      </div>
    </div>
  );
}

function DaySection({
  dateKey,
  appointments,
}: {
  dateKey: string;
  appointments: AppointmentWithRelations[];
}) {
  const date = new Date(dateKey + "T12:00:00");
  const isCurrentDay = isToday(date);
  const isTomorrowDay = isTomorrow(date);

  const dayLabel = isCurrentDay
    ? "Today"
    : isTomorrowDay
    ? "Tomorrow"
    : format(date, "EEEE");

  const dateLabel = format(date, "d MMM");
  return (
    <div className="mb-4">
      {/* Day header */}
      <div className="flex items-center gap-2 py-2 mb-1 sticky top-0 z-10">
        <span className={`text-sm font-semibold ${isCurrentDay ? "text-gray-300" : "text-gray-400"}`}>
          {dayLabel}
        </span>
        <span className="text-xs text-gray-400">{dateLabel}</span>
        {appointments.length > 0 && (
          <span className="ml-auto text-[10px] font-medium bg-zinc-900 rounded-full px-2 py-0.5 mr-2">
            {appointments.length} Appointments
          </span>
        )}
      </div>

      {appointments.length === 0 ? (
        <div className="pl-2 py-2 text-sm text-gray-300">No appointments</div>
      ) : (
        <div className="space-y-1.5">
          {appointments.map((appt) => (
            <AgendaRow key={appt.id} appointment={appt} />
          ))}
        </div>
      )}
    </div>
  );
}

function AgendaRow({ appointment: a }: { appointment: AppointmentWithRelations }) {
  const start = toZonedTime(new Date(a.start_at), TIMEZONE);
  const end = toZonedTime(new Date(a.end_at), TIMEZONE);
  const now = new Date();
  const isNow = new Date(a.start_at) <= now && new Date(a.end_at) > now;

  return (
    <Link
      href={`/admin/appointments/${a.id}`}
      className="flex items-center gap-3 bg-card border rounded-xl px-4 py-3 hover:bg-muted/50 hover:border-border/80 active:scale-[0.99] transition-all"
    >
      {/* Time column */}
      <div className="text-xs tabular-nums text-gray-400 w-16 shrink-0 text-right">
        <div className={`font-medium ${isNow ? "text-blue-600" : "text-gray-700"}`}>
          {format(start, "h:mm a")}
        </div>
        <div>{format(end, "h:mm a")}</div>
      </div>

      {/* Divider */}
      <div className={`w-0.5 h-8 rounded-full shrink-0 ${isNow ? "bg-blue-400" : "bg-gray-200"}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {a.client.first_name} {a.client.last_name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 truncate">{a.type.name}</span>
          <span className="flex items-center gap-0.5 text-[10px] text-gray-300 shrink-0">
            <MapPin className="h-2.5 w-2.5" />{a.location.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
