import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { BookingShell } from "@/components/booking/BookingShell";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string; token?: string; intake?: string }>;
}) {
  const { id, token, intake } = await searchParams;
  const { slug } = await params;
  const isNewClient = intake === "1";

  let appt: AppointmentWithRelations | null = null;

  if (id) {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("appointments")
      .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
      .eq("id", id)
      .maybeSingle();
    appt = data as AppointmentWithRelations | null;
  }

  return (
    <BookingShell backHref="/appointments" backLabel="Book another appointment">
      <div className="px-8 py-10 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">You&apos;re booked</h1>
        <p className="text-sm text-gray-400 mb-6">A confirmation has been sent to your email.</p>

        {appt && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-left space-y-2.5 text-sm mb-6">
            <SummaryRow label="Service" value={appt.type.name} />
            <SummaryRow label="Location" value={appt.location.name} />
            <SummaryRow
              label="Date"
              value={format(toZonedTime(new Date(appt.start_at), appt.timezone), "EEEE d MMMM yyyy")}
            />
            <SummaryRow
              label="Time"
              value={format(toZonedTime(new Date(appt.start_at), appt.timezone), "h:mm a")}
            />
          </div>
        )}

        {token && (
          <Link
            href={`/manage/${token}`}
            className="inline-block text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 mb-2"
          >
            Reschedule or cancel
          </Link>
        )}

        {isNewClient && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left mt-4">
            <p className="text-sm font-medium text-blue-900 mb-1">One more thing</p>
            <p className="text-sm text-blue-700 mb-3">
              We have a short intake form to help us prepare for your first session.
            </p>
            <div className="flex gap-2">
              {id && (
                <Link
                  href={`/appointments/${slug}/intake?appointmentId=${id}`}
                  className="flex-1 text-center bg-blue-600 text-white text-sm font-medium py-2 rounded-lg"
                >
                  Complete intake form
                </Link>
              )}
              <span className="flex-1 text-center text-sm text-blue-500 py-2 cursor-default">
                Skip for now
              </span>
            </div>
          </div>
        )}
      </div>
    </BookingShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  );
}
