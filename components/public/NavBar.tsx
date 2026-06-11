"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import type { NavItem } from "@/lib/supabase/types";

export function NavBar({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <header className="bg-stone-900 text-stone-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="font-semibold tracking-wide text-amber-400 hover:text-amber-300 transition-colors">
          Wildheart Psychotherapy
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {items.map((item) =>
            item.children ? (
              <div key={item.label} className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors">
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-stone-800 border border-stone-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href!}
                      className="block px-4 py-2.5 text-sm hover:bg-white/10 first:rounded-t-xl last:rounded-b-xl transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  pathname === item.href ? "text-amber-400" : "hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-700 pb-4">
          {items.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/5"
                  onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${expanded === item.label ? "rotate-180" : ""}`}
                  />
                </button>
                {expanded === item.label && (
                  <div className="bg-stone-800/50">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href!}
                        onClick={() => setOpen(false)}
                        className="block px-8 py-2.5 text-sm text-stone-300 hover:text-white hover:bg-white/5"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm hover:bg-white/5"
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
