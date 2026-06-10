import { createServiceClient } from "@/lib/supabase/server";
import { AvailabilityEditor } from "@/components/admin/AvailabilityEditor";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const supabase = createServiceClient();
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, slug")
    .order("name");

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-5">Availability</h1>
      <AvailabilityEditor locations={locations ?? []} />
    </div>
  );
}
