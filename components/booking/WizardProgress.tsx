const LABELS = ["Select time", "Your details", "Confirm"];

export function WizardProgress({
  step,
  locationName,
  typeName,
}: {
  step: 1 | 2 | 3;
  locationName: string;
  typeName: string;
}) {
  const progress = (step / 3) * 100;

  return (
    <>
      <div className="h-1 bg-stone-100">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="px-5 py-3 border-b border-stone-100">
        <div className="flex items-center gap-1 text-sm flex-wrap min-w-0 text-stone-500">
          <span className="truncate">{locationName}</span>
          <span className="text-stone-300 shrink-0 px-0.5">›</span>
          <span className="font-medium text-stone-700 truncate">{typeName}</span>
          <span className="text-stone-300 shrink-0 px-0.5">›</span>
          <span className="font-medium text-amber-600 shrink-0">{LABELS[step - 1]}</span>
        </div>
      </div>
    </>
  );
}
