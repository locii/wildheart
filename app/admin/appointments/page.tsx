import { createServiceClient } from "@/lib/supabase/server";
import { ScheduleCalendar } from "@/components/admin/ScheduleCalendar";
import { AppointmentsList } from "@/components/admin/AppointmentsList";
import { ViewToggle } from "@/components/admin/ViewToggle";
import { AppointmentImportButton } from "@/components/admin/AppointmentImportButton";
import type { Location, AppointmentType } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const showList = view === "list";

  const supabase = createServiceClient();

  const [{ data: locData }, { data: typesData }] = await Promise.all([
    supabase.from("locations").select("*").order("name"),
    supabase.from("appointment_types").select("*").eq("is_active", true).order("sort_order"),
  ]);

  const locations = (locData ?? []) as Location[];
  const types = (typesData ?? []) as AppointmentType[];

  return (
    <div className="px-4 py-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Schedule</h1>
        <div className="flex items-center gap-2">
          <ViewToggle showList={showList} />
          <AppointmentImportButton />
          <a
            href="/admin/appointments/new"
            className="hidden md:inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-3 py-2 rounded-lg"
          >
            + New
          </a>
        </div>
      </div>

      {showList ? (
        <AppointmentsList locations={locations} />
      ) : (
        <ScheduleCalendar locations={locations} types={types} />
      )}
    </div>
  );
}
