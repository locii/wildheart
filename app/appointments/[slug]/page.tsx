import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { BookingShell } from "@/components/booking/BookingShell";
import type { Location, AppointmentType } from "@/lib/supabase/types";

export default async function AppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const isEmbed = embed === "true";

  const supabase = createServiceClient();

  const [{ data: locData }, { data: typesData }] = await Promise.all([
    supabase.from("locations").select("*"),
    supabase.from("appointment_types").select("*").eq("is_active", true).order("sort_order"),
  ]);

  const locations = (locData ?? []) as Location[];
  const types = (typesData ?? []) as AppointmentType[];

  const location = locations.find((l) => l.slug === slug);
  const preselectedType = !location ? types.find((t) => t.slug === slug) : undefined;

  if (!location && !preselectedType) notFound();

  if (isEmbed) {
    return (
      <BookingFlow
        locations={location ? [location] : locations}
        initialLocation={location}
        types={types}
        initialType={preselectedType}
        embed
      />
    );
  }

  const subtitle = location?.name;

  return (
    <BookingShell>
      <div className="px-8 pt-8 pb-2 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Wildheart Psychotherapy</p>
        <h1 className="text-xl font-semibold text-gray-900">Make a booking</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">
        <BookingFlow
          locations={location ? [location] : locations}
          initialLocation={location}
          types={types}
          initialType={preselectedType}
          embed={false}
        />
      </div>
    </BookingShell>
  );
}
