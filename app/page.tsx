import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { BookingShell } from "@/components/booking/BookingShell";
import { MapPin } from "lucide-react";
import Link from "next/link";
import type { Location } from "@/lib/supabase/types";

export default async function RootPage() {
  const supabase = createServiceClient();
  const { data } = await supabase.from("locations").select("*").eq("is_active", true).order("name");
  const locations = (data ?? []) as Location[];

  if (locations.length === 1) {
    redirect(`/${locations[0].slug}`);
  }

  return (
    <BookingShell>
      <div className="px-8 py-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Wildheart Psychotherapy</h1>
        <p className="text-sm text-stone-400 mt-0.5">Choose a location to get started</p>
      </div>
      <div className="p-5 space-y-2">
        {locations.map((l) => (
          <Link
            key={l.id}
            href={`/${l.slug}`}
            className="flex items-start gap-3 w-full p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition-colors text-left"
          >
            <MapPin className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm text-stone-800">{l.name}</div>
              {l.address && <div className="text-xs text-stone-400 mt-0.5">{l.address}</div>}
            </div>
          </Link>
        ))}
      </div>
    </BookingShell>
  );
}
