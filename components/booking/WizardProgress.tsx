"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

type StepId = "select-time" | "details" | "confirm";

const STEPS: StepId[] = ["select-time", "details", "confirm"];
const STEP_LABELS: Record<StepId, string> = {
  "select-time": "Select time",
  details: "Your details",
  confirm: "Confirm",
};

export function WizardProgress({
  locationName,
  typeName,
}: {
  locationName: string;
  typeName: string;
}) {
  const pathname = usePathname();
  const currentStep = STEPS.find((s) => pathname.endsWith(`/${s}`)) ?? "select-time";
  const stepIdx = STEPS.indexOf(currentStep);
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  return (
    <>
      <div className="h-1 bg-stone-100">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="px-5 py-3 border-b border-stone-100">
        <div className="flex items-center gap-1.5 text-sm flex-wrap min-w-0">
          <span className="text-stone-400 truncate">{locationName}</span>
          <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0" />
          <span className="text-stone-700 font-medium truncate">{typeName}</span>
          <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0" />
          <span className="text-amber-600 font-medium">{STEP_LABELS[currentStep]}</span>
        </div>
      </div>
    </>
  );
}
