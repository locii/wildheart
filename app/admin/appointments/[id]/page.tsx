import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { AppointmentDetail } from "@/components/admin/AppointmentDetail";
import type { AppointmentWithRelations } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("appointments")
    .select("*, client:clients(*), location:locations(*), type:appointment_types(*)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return <AppointmentDetail appointment={data as unknown as AppointmentWithRelations} />;
}
