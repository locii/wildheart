"use client";

import { ArrowLeft } from "lucide-react";

const BG =
  "https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto//w_1200/1042/balazs-busznyak-T5MCCh70zYE-unsplash_wftlpo";

export function BookingShell({
  children,
  maxWidth = "max-w-xl",
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  maxWidth?: string;
}) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center px-4 py-12"
      style={{ backgroundImage: `url(${BG})` }}
    >
      <div className={`w-full ${maxWidth}`}>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="theme-light bg-white rounded-3xl shadow-2xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
