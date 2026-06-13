export default function Loading() {
  return (
    <>
      <div className="h-1 bg-stone-100">
        <div className="h-full bg-amber-200 w-1/3" />
      </div>
      <div className="px-5 py-3 border-b border-stone-100">
        <div className="h-4 w-48 bg-stone-100 rounded animate-pulse" />
      </div>
      <div className="p-5 flex flex-col md:flex-row gap-6">
        <div className="md:w-64 space-y-2">
          <div className="h-6 w-32 bg-stone-100 rounded animate-pulse mx-auto" />
          <div className="grid grid-cols-7 gap-y-1 mt-3">
            {Array(35).fill(null).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-stone-100 animate-pulse mx-0.5" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3 text-stone-400">
            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm">Loading availability…</span>
          </div>
        </div>
      </div>
    </>
  );
}
