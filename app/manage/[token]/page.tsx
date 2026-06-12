import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { createServiceClient } from "@/lib/supabase/server";
import { ManageActions } from "@/components/booking/ManageActions";
import { BookingShell } from "@/components/booking/BookingShell";
import { CalendarDays, Clock, MapPin, AlertCircle } from "lucide-react";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

export default async function ManagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: tokenRow } = await supabase
    .from("appointment_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = tokenRow as any;
  if (!row) return <ErrorPage message="This link is invalid or has already been used." />;
  const isExpired = new Date(row.expires_at) < new Date();
  if (isExpired && process.env.NODE_ENV !== "development") {
    return <ErrorPage message="This link has expired. Please contact us to make changes." />;
  }

  const { data } = await supabase
    .from("appointments")
    .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
    .eq("id", row.appointment_id)
    .maybeSingle();

  const appt = data as AppointmentWithRelations | null;
  if (!appt) return <ErrorPage message="Appointment not found." />;

  if (appt.cancelled_at) {
    return (
      <BookingShell maxWidth="max-w-sm">
        <div className="px-8 py-10 text-center">
          <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <h1 className="text-lg font-semibold mb-1">Appointment cancelled</h1>
          <p className="text-sm text-gray-400">This appointment has already been cancelled.</p>
        </div>
      </BookingShell>
    );
  }

  const start = toZonedTime(new Date(appt.start_at), appt.timezone);
  const end = toZonedTime(new Date(appt.end_at), appt.timezone);
  const isPast = new Date(appt.end_at) < new Date();

  return (
    <BookingShell maxWidth="max-w-sm">
      <div className="px-8 py-10">
        <div className="text-center mb-7">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Wildheart Psychotherapy</p>
          <h1 className="text-xl font-semibold text-gray-900">Your appointment</h1>
        </div>

        <div className="rounded-2xl border border-gray-100 overflow-hidden mb-5 shadow-sm">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
            <div className="font-medium text-gray-900">{appt.type.name}</div>
          </div>
          <div className="px-5 py-4 space-y-3.5 text-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
              {format(start, "EEEE d MMMM yyyy")}
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              {format(start, "h:mm a")} – {format(end, "h:mm a")}
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              {appt.location.name}
            </div>
          </div>
        </div>

        {isPast ? (
          <p className="text-sm text-gray-400 text-center">This appointment has already taken place.</p>
        ) : (
          <ManageActions token={token} appointment={appt} />
        )}
      </div>
    </BookingShell>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <BookingShell maxWidth="max-w-sm">
      <div className="px-8 py-10 text-center">
        <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
        <h1 className="text-lg font-semibold mb-1">Link unavailable</h1>
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </BookingShell>
  );
}
