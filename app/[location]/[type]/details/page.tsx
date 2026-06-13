import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import type { AppointmentType, Location } from "@/lib/supabase/types";
import { WizardProgress } from "@/components/booking/WizardProgress";
import { DetailsForm } from "@/app/appointments/[slug]/[type]/details/DetailsForm";

export default async function DetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ location: string; type: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { location: slug, type: typeParam } = await params;
  const sp = await searchParams;

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
    <>
      <WizardProgress step={2} locationName={location.name} typeName={apptType.name} />
      <div className="p-5">
        <DetailsForm locationSlug={slug} typeSlug={typeParam} date={sp.date ?? ""} slot={sp.slot ?? ""} />
      </div>
    </>
  );
}
