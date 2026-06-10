import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { AdminBookingFlow } from "@/components/admin/AdminBookingFlow";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Location, AppointmentType } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function NewAppointmentPage() {
  const supabase = createServiceClient();
  const authClient = await createClient();

  const { data: { user } } = await authClient.auth.getUser();

  const { data: locData } = await supabase.from("locations").select("*").order("name");
  const locations = (locData ?? []) as Location[];

  const { data: typesData } = await supabase
    .from("appointment_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  const types = (typesData ?? []) as AppointmentType[];

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <Link
        href="/admin/appointments"
        className="inline-flex items-center gap-1 text-sm text-gray-500 mb-5 -ml-1"
      >
        <ChevronLeft className="h-4 w-4" /> Appointments
      </Link>
      <h1 className="text-xl font-semibold mb-5">New appointment</h1>
      <AdminBookingFlow
        locations={locations}
        types={types}
        adminEmail={user?.email ?? "admin"}
      />
    </div>
  );
}
