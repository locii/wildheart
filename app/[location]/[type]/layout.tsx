import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { BookingShell } from "@/components/booking/BookingShell";
import type { Location, AppointmentType } from "@/lib/supabase/types";

export default async function WizardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ location: string; type: string }>;
}) {
  const { location: slug, type: typeParam } = await params;
  const supabase = createServiceClient();

  const { data: locData } = await supabase.from("locations").select("*").eq("slug", slug).maybeSingle();
  const location = locData as Location | null;
  if (!location) notFound();

  const { data: typesData } = await supabase.from("appointment_types").select("*");
  const apptType = ((typesData ?? []) as AppointmentType[]).find(
    (t) => t.slug === typeParam || t.id === typeParam
  );
  if (!apptType) notFound();

  return (
    <BookingShell backHref={`/${slug}`}>
      <div className="px-8 py-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Wildheart Psychotherapy — {location.name}</h1>
        {location.address && (
          <p className="text-sm text-stone-400 mt-0.5">{location.address}</p>
        )}
      </div>
      {children}
    </BookingShell>
  );
}
