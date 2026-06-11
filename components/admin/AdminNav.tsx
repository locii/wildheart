"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CalendarDays,
  LogOut,
  Plus,
  Settings,
  FileStack,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WildhartMark } from "@/components/brand/Logo";

export const groups = [
  {
    label: "Appointments",
    icon: CalendarDays,
    href: "/admin/dashboard",
    prefix: ["/admin/dashboard", "/admin/appointments", "/admin/clients", "/admin/reports", "/admin/contact"],
  },
  {
    label: "Content",
    icon: FileStack,
    href: "/admin/pages",
    prefix: ["/admin/pages", "/admin/resources", "/admin/sidebar-blocks"],
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/locations",
    prefix: ["/admin/locations", "/admin/availability", "/admin/services", "/admin/embed"],
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-48 border-r bg-card h-screen sticky top-0 shrink-0">
        <div className="px-4 py-4 border-b">
          <WildhartMark className="h-12 w-auto" />
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {groups.map(({ label, icon: Icon, href, prefix }) => {
            const isActive = prefix.some((p) => pathname.startsWith(p));
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "text-accent-foreground bg-accent/10"
                    : "text-gray-500 hover:bg-black/10 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-2 py-3 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-muted/50 hover:text-gray-900 w-full transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav — groups only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex">
        {groups.map(({ label, icon: Icon, href, prefix }) => {
          const isActive = prefix.some((p) => pathname.startsWith(p));
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                isActive ? "text-accent-foreground" : "text-gray-400"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.2]" : "stroke-[1.6]")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile floating action button */}
      <Link
        href="/admin/appointments/new"
        className="md:hidden fixed bottom-20 right-4 z-50 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
      >
        <Plus className="h-5 w-5" />
      </Link>
    </>
  );
}
