import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { BookingShell } from "@/components/booking/BookingShell";
import { Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import type { Location, AppointmentType } from "@/lib/supabase/types";

export default async function LocationPage({
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
  const [{ data: locData }, { data: typesData }] = await Promise.all([
    supabase.from("locations").select("*"),
    supabase.from("appointment_types").select("*").eq("is_active", true).order("sort_order"),
  ]);

  const locations = (locData ?? []) as Location[];
  const types = (typesData ?? []) as AppointmentType[];
  const location = locations.find((l) => l.slug === slug);
  if (!location) notFound();

  // Embed mode: keep the in-page wizard
  if (isEmbed) {
    return (
      <BookingFlow
        locations={[location]}
        initialLocation={location}
        types={types}
        embed
      />
    );
  }

  const visibleTypes = types.filter(
    (t) => t.is_public && (t.location_id === null || t.location_id === location.id)
  );

  return (
    <BookingShell backHref="/">
      <div className="px-8 py-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Wildheart Psychotherapy — {location.name}</h1>
        {location.address && (
          <p className="text-sm text-stone-400 mt-0.5">{location.address}</p>
        )}
      </div>
      <div className="h-1 bg-stone-100" />
      <div className="p-5 space-y-2">
        {visibleTypes.map((t) => {
          const typeKey = t.slug ?? t.id;
          return (
            <Link
              key={t.id}
              href={`/${slug}/${typeKey}/select-time`}
              className="flex flex-col w-full p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition-colors text-left"
            >
              <div className="font-medium text-sm text-stone-800">{t.name}</div>
              
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-stone-500">
                  <Clock className="h-3 w-3" />{t.duration_minutes} min
                </span>
                {t.price > 0 && (
                  <span className="flex items-center gap-1 text-xs text-stone-500">
                    <DollarSign className="h-3 w-3" />{t.price}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </BookingShell>
  );
}
