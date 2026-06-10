export function WildhartMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 220"
      role="img"
      aria-labelledby="wh-title"
      className={className}
    >
      <title id="wh-title">WildHeart Psychotherapy</title>

      <text
        x="340"
        y="120"
        textAnchor="middle"
        fontFamily='"Cormorant Garamond", "Iowan Old Style", "Baskerville", Georgia, serif'
        fontSize="120"
        fontWeight="400"
        fill="#fff"
        letterSpacing="-0.02em"
      >
        WildHeart
      </text>

      <text
        x="340"
        y="200"
        textAnchor="middle"
        fontFamily='"Avenir Next", "Helvetica Neue", sans-serif'
        fontSize="50"
        fontWeight="300"
        fill="#fff"
        letterSpacing="0.18em"
      >
        PSYCHOTHERAPY
      </text>
    </svg>
  );
}

export function WildhartLogo({ className }: { className?: string }) {
  return <WildhartMark className={className} />;
}
