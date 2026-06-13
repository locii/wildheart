import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import type { AppointmentType, Location } from "@/lib/supabase/types";
import { BookingWizard } from "@/components/booking/BookingWizard";

export default async function SelectTimePage({
  params,
}: {
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
    <BookingWizard
      locationSlug={slug}
      typeSlug={typeParam}
      locationName={location.name}
      typeName={apptType.name}
      typeId={apptType.id}
      duration={apptType.duration_minutes}
      price={apptType.price}
    />
  );
}
