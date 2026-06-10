"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, List } from "lucide-react";

export function ViewToggle({ showList }: { showList: boolean }) {
  const router = useRouter();
  return (
    <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
      <button
        onClick={() => router.push("/admin/appointments")}
        className={`p-1.5 rounded-md transition-colors ${!showList ? "bg-white shadow-sm text-gray-900" : "text-muted-foreground hover:text-foreground"}`}
        title="Calendar view"
      >
        <CalendarDays className="h-4 w-4" />
      </button>
      <button
        onClick={() => router.push("/admin/appointments?view=list")}
        className={`p-1.5 rounded-md transition-colors ${showList ? "bg-white shadow-sm text-gray-900" : "text-muted-foreground hover:text-foreground"}`}
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
