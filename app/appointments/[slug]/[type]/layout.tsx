import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { BookingShell } from "@/components/booking/BookingShell";
import { WizardProgress } from "@/components/booking/WizardProgress";
import type { Location, AppointmentType } from "@/lib/supabase/types";

export default async function WizardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; type: string }>;
}) {
  const { slug, type: typeParam } = await params;
  const supabase = createServiceClient();

  const { data: locData } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  const location = locData as Location | null;
  if (!location) notFound();

  const { data: typesData } = await supabase.from("appointment_types").select("*");
  const apptType = ((typesData ?? []) as AppointmentType[]).find(
    (t) => t.slug === typeParam || t.id === typeParam
  );
  if (!apptType) notFound();

  return (
    <BookingShell backHref={`/appointments/${slug}`}>
      <div className="px-8 pt-7 pb-1 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">
          Wildheart Psychotherapy
        </p>
        <h1 className="text-xl font-semibold text-gray-900">Make a booking</h1>
      </div>
      <WizardProgress locationName={location.name} typeName={apptType.name} />
      <div className="p-5">{children}</div>
    </BookingShell>
  );
}
