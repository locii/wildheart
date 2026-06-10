export function WildhartMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 240"
      role="img"
      aria-labelledby="wh-title"
      className={className}
    >
      <title id="wh-title">WildHeart Psychotherapy</title>

      <rect width="100%" height="100%" fill="white" />

      <text
        x="450"
        y="108"
        textAnchor="middle"
        fontFamily='"Cormorant Garamond", "Iowan Old Style", "Baskerville", Georgia, serif'
        fontSize="84"
        fontWeight="400"
        fill="#2B3B34"
        letterSpacing="-0.02em"
      >
        WildHeart
      </text>

      <line x1="320" y1="138" x2="580" y2="138" stroke="#BFC7C0" strokeWidth="1.4" />

      <text
        x="450"
        y="175"
        textAnchor="middle"
        fontFamily='"Avenir Next", "Helvetica Neue", sans-serif'
        fontSize="22"
        fontWeight="300"
        fill="#6C756E"
        letterSpacing="0.12em"
      >
        Psychotherapy
      </text>
    </svg>
  );
}

export function WildhartLogo({ className }: { className?: string }) {
  return <WildhartMark className={className} />;
}
