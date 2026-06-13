import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import type { AppointmentType, Location } from "@/lib/supabase/types";
import { ConfirmStep } from "./ConfirmStep";

export default async function ConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; type: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug, type: typeParam } = await params;
  const sp = await searchParams;

  const date = sp.date ?? "";
  const slot = sp.slot ?? "";
  const first = sp.first ?? "";
  const last = sp.last ?? "";
  const email = sp.email ?? "";
  const phone = sp.phone ?? "";

  if (!date || !slot || !first || !last || !email) {
    // Missing state — send back to start of this booking
    const { redirect } = await import("next/navigation");
    redirect(`/appointments/${slug}/${typeParam}/select-time`);
  }

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
    <ConfirmStep
      location={location}
      apptType={apptType}
      date={date}
      slot={slot}
      client={{ first_name: first, last_name: last, email, phone }}
      locationSlug={slug}
      typeSlug={typeParam}
    />
  );
}
