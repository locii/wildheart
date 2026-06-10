export function WildhartMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Wild branches emerging from the heart's dip */}
      <path
        d="M12 8C10.5 5.5 9 4 7 2.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M12 8C13.5 5.5 15 4 17 2.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="7" cy="2.5" r="1.1" fill="currentColor" />
      <circle cx="17" cy="2.5" r="1.1" fill="currentColor" />

      {/* Heart */}
      <path
        d="M2.5 8A5 5 0 0 1 12 8A5 5 0 0 1 21.5 8Q21.5 16.5 12 22Q2.5 16.5 2.5 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WildhartLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <WildhartMark className="h-7 w-7 shrink-0" />
      <span className="font-semibold text-base tracking-tight">Wildheart</span>
    </div>
  );
}
