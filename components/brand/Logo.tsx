export function WildhartMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 220"
      role="img"
      aria-labelledby="wh-logo-title"
      className={className}
    >
      <title id="wh-logo-title">WildHeart Psychotherapy</title>

      {/* Background */}
      <rect
        width="100%"
        height="100%"
        rx="12"
        fill="rgba(0,0,0,0.5)"
      />

      {/* Wordmark */}
      <text
        x="450"
        y="96"
        textAnchor="middle"
        fontFamily='"Cormorant Garamond", "Baskerville", Georgia, serif'
        fontSize="84"
        fontWeight="400"
        letterSpacing="-0.025em"
        fill="#f7f4ef"
      >
        WildHeart
      </text>

      {/* Rule */}
      <line
        x1="290" y1="122" x2="610" y2="122"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />

      {/* Sub */}
      <text
        x="450"
        y="156"
        textAnchor="middle"
        fontFamily='Inter, "Helvetica Neue", Arial, sans-serif'
        fontSize="21"
        fontWeight="350"
        letterSpacing="0.32em"
        fill="rgba(255,255,255,0.72)"
        style={{ textTransform: "uppercase" }}
      >
        PSYCHOTHERAPY
      </text>
    </svg>
  );
}

export function WildhartLogo({ className }: { className?: string }) {
  return <WildhartMark className={className} />;
}
