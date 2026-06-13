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
  const preselectedType = !location ? types.find((t) => t.slug === slug || t.id === slug) : undefined;

  if (!location && !preselectedType) notFound();

  // Embed mode: keep the in-page wizard
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

  // Type pre-selected (accessed via /appointments/[typeSlug] directly):
  // Fall back to old wizard behaviour so existing links keep working
  if (preselectedType && !location) {
    const loc = locations.find((l) => l.id === preselectedType.location_id) ?? locations[0];
    return (
      <BookingShell backHref="/appointments">
        <div className="px-8 pt-8 pb-2 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Wildheart Psychotherapy</p>
          <h1 className="text-xl font-semibold text-gray-900">Make a booking</h1>
        </div>
        <div className="p-5">
          <BookingFlow
            locations={loc ? [loc] : locations}
            initialLocation={loc}
            types={types}
            initialType={preselectedType}
            embed={false}
          />
        </div>
      </BookingShell>
    );
  }

  // Normal case: show service picker for this location
  const visibleTypes = types.filter(
    (t) => t.is_public && (t.location_id === null || t.location_id === location!.id)
  );

  return (
    <BookingShell backHref="/appointments">
      <div className="px-8 pt-8 pb-2 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Wildheart Psychotherapy</p>
        <h1 className="text-xl font-semibold text-gray-900">Make a booking</h1>
        <p className="text-sm text-stone-400 mt-0.5">{location!.name}</p>
      </div>
      <div className="h-1 bg-stone-100" />
      <div className="p-5 space-y-2">
        {visibleTypes.map((t) => {
          const typeKey = t.slug ?? t.id;
          return (
            <Link
              key={t.id}
              href={`/appointments/${slug}/${typeKey}/select-time`}
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
