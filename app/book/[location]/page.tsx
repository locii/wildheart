import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking/BookingFlow";
import type { Location, AppointmentType } from "@/lib/supabase/types";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ location: string }>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { location: slug } = await params;
  const { embed } = await searchParams;
  const isEmbed = embed === "true";

  const supabase = createServiceClient();

  const { data: locData } = await supabase.from("locations").select("*");
  const location = ((locData ?? []) as Location[]).find((l) => l.slug === slug);
  if (!location) notFound();

  const { data: typesData } = await supabase
    .from("appointment_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  const types = (typesData ?? []) as AppointmentType[];

  return (
    <div className={isEmbed ? "" : "max-w-lg mx-auto px-4 py-8"}>
      {!isEmbed && (
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold">Wildheart Psychotherapy</h1>
          <p className="text-sm text-gray-500 mt-0.5">{location.name}</p>
        </div>
      )}
      <BookingFlow location={location} types={types} embed={isEmbed} />
    </div>
  );
}
