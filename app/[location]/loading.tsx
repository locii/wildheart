import { BookingShell } from "@/components/booking/BookingShell";

export default function Loading() {
  return (
    <BookingShell>
      <div className="px-8 py-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Wildheart Psychotherapy</h1>
      </div>
      <div className="p-5 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-stone-200 bg-stone-50 animate-pulse" />
        ))}
      </div>
    </BookingShell>
  );
}
