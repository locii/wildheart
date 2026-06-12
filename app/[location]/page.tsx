import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { BookingShell } from "@/components/booking/BookingShell";
import type { Location, AppointmentType } from "@/lib/supabase/types";

export default async function LocationPage({ params }: { params: Promise<{ location: string }> }) {
  const { location: slug } = await params;
  const supabase = createServiceClient();

  const [{ data: locData }, { data: typesData }] = await Promise.all([
    supabase.from("locations").select("*").eq("is_active", true),
    supabase.from("appointment_types").select("*").eq("is_active", true).order("sort_order"),
  ]);

  const locations = (locData ?? []) as Location[];
  const types = (typesData ?? []) as AppointmentType[];

  const initialLocation = locations.find((l) => l.slug === slug);
  if (!initialLocation) notFound();

  return (
    <BookingShell>
      <div className="px-8 pt-8 pb-2 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Wildheart Psychotherapy</p>
        <h1 className="text-xl font-semibold text-gray-900">Make a booking</h1>
      </div>
      <div className="p-6">
        <BookingFlow locations={locations} initialLocation={initialLocation} types={types} embed={false} />
      </div>
    </BookingShell>
  );
}
