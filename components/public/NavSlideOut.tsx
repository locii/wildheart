"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import type { NavItem } from "@/lib/supabase/types";

export function NavSlideOut({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="no-theme-link flex flex-col gap-2 cursor-pointer group"
      >
       <span className="block w-10 h-px bg-white group-hover:bg-amber-600 transition-colors" />
  <span className="block w-10 h-px bg-white group-hover:bg-amber-600 transition-colors mt-1" />

      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out panel */}
      <div
        className="fixed top-4 bottom-0 right-4 z-100 w-full max-w-sm rounded-xl bg-white shadow-2xl transition-transform duration-300"
        style={{ transform: open ? "translateX(0)" : "translateX(calc(100% + 1rem))" }}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="flex justify-end px-4 py-5">
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 -mt-10">
            <ul className="space-y-0.5">
              <li>
                <Link
                    href="/"
                    className="w-full flex items-center justify-between px-4 py-2.5 text-gray-800 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Home
                  </Link>      
                    

              </li>
              {items.map((item) =>
                item.children ? (
                  <li key={item.label}>
                    <button
                      className="w-full flex items-center justify-between px-4 py-2.5 text-gray-800 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          expanded === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expanded === item.label && (
                      <ul className="pl-4 mt-0.5 space-y-0.5">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href!}
                              onClick={() => setOpen(false)}
                              className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href!}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 text-gray-800 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div className="px-4 py-6 border-t border-gray-100 space-y-2">
            <Link
              href="/appointments/brunswick"
              onClick={() => setOpen(false)}
              className="block w-full text-center px-4 py-3 bg-orange-500 text-white! font-medium rounded-lg hover:bg-orange-600 transition-colors text-sm uppercase tracking-wide"
            >
              Book a Session
            </Link>
            <Link
              href="/appointments/book-an-introductory-chat"
              onClick={() => setOpen(false)}
              className="block w-full text-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Free 20-min intro call
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
