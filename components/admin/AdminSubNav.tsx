"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart2,
  FileText,
  BookOpen,
  PanelRight,
  MapPin,
  Clock,
  Layers,
  Code2,
  MessageSquare,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { groups } from "./AdminNav";

const subItems: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  Appointments: [
    { href: "/admin/dashboard", label: "Today", icon: LayoutDashboard },
    { href: "/admin/appointments", label: "Schedule", icon: CalendarDays },
    { href: "/admin/clients", label: "Clients", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: BarChart2 },
    { href: "/admin/contact", label: "Messages", icon: MessageSquare },
  ],
  Content: [
    { href: "/admin/pages", label: "Pages", icon: FileText },
    { href: "/admin/resources", label: "Articles", icon: BookOpen },
    { href: "/admin/menus", label: "Menus", icon: Menu },
    { href: "/admin/sidebar-blocks", label: "Blocks", icon: PanelRight },
  ],
  Settings: [
    { href: "/admin/locations", label: "Locations", icon: MapPin },
    { href: "/admin/availability", label: "Hours", icon: Clock },
    { href: "/admin/services", label: "Services", icon: Layers },
    { href: "/admin/embed", label: "Embed", icon: Code2 },
  ],
};

export function AdminSubNav() {
  const pathname = usePathname();

  const activeGroup = groups.find((g) =>
    g.prefix.some((p) => pathname.startsWith(p))
  );

  if (!activeGroup) return null;

  const items = subItems[activeGroup.label] ?? [];

  return (
    <div className="border-b bg-card px-4 flex items-center gap-1 h-10 shrink-0">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-1.5 px-3 h-full text-sm transition-colors border-b-2 -mb-px",
            pathname.startsWith(href)
              ? "border-primary text-foreground font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          {label}
        </Link>
      ))}
    </div>
  );
}
