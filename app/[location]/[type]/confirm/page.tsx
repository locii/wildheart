import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import type { AppointmentType, Location } from "@/lib/supabase/types";
import { WizardProgress } from "@/components/booking/WizardProgress";
import { ConfirmStep } from "@/app/appointments/[slug]/[type]/confirm/ConfirmStep";

export default async function ConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ location: string; type: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { location: slug, type: typeParam } = await params;
  const sp = await searchParams;

  const { date = "", slot = "", first = "", last = "", email = "", phone = "" } = sp;

  if (!date || !slot || !first || !last || !email) {
    redirect(`/${slug}/${typeParam}/select-time`);
  }

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
      <WizardProgress step={3} locationName={location.name} typeName={apptType.name} />
      <div className="p-5">
        <ConfirmStep
          location={location}
          apptType={apptType}
          date={date}
          slot={slot}
          client={{ first_name: first, last_name: last, email, phone }}
          locationSlug={slug}
          typeSlug={typeParam}
        />
      </div>
    </>
  );
}
