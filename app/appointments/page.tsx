import { createServiceClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { PublicLayout } from "@/components/public/PublicLayout";
import { getNav } from "@/lib/cms";
import type { Location, AppointmentType } from "@/lib/supabase/types";

export default async function AppointmentsPage() {
  const supabase = createServiceClient();

  const [{ data: locData }, { data: typesData }, nav] = await Promise.all([
    supabase.from("locations").select("*").eq("is_active", true),
    supabase.from("appointment_types").select("*").eq("is_active", true).order("sort_order"),
    getNav(),
  ]);

  const locations = (locData ?? []) as Location[];
  const types = (typesData ?? []) as AppointmentType[];

  return (
    <PublicLayout nav={nav}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-stone-900">Make a booking</h1>
          <p className="text-sm text-stone-500 mt-0.5">Wildheart Psychotherapy</p>
        </div>
        <BookingFlow
          locations={locations}
          types={types}
          embed={false}
        />
      </div>
    </PublicLayout>
  );
}
