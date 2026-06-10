import { LocationsEditor } from "@/components/admin/LocationsEditor";

export const dynamic = "force-dynamic";

export default function LocationsPage() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-semibold">Locations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Slugs are permanent — they appear in booking URLs and cannot be changed after creation.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          To enable colour selection, run in Supabase SQL editor:{" "}
          <code className="bg-muted px-1 rounded">ALTER TABLE locations ADD COLUMN IF NOT EXISTS color text;</code>
        </p>
      </div>
      <LocationsEditor />
    </div>
  );
}
