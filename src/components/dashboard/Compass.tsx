// Dial that turns against the phone so the orange N always points to
// magnetic north; the fixed marker at the top is where the phone is heading.
export default function Compass({
  heading,
  points,
}: {
  heading: number;
  /** Localised labels for N, E, S, W, in that order. */
  points: [string, string, string, string];
}) {
  const letters = [
    { label: points[0], angle: 0, north: true },
    { label: points[1], angle: 90, north: false },
    { label: points[2], angle: 180, north: false },
    { label: points[3], angle: 270, north: false },
  ];

  return (
    <svg viewBox="-50 -50 100 100" className="h-24 w-24 shrink-0" aria-hidden="true">
      <circle r="42" className="fill-trail-950" />
      <circle r="42" className="fill-none stroke-white/15" strokeWidth="1.5" />
      <g style={{ transform: `rotate(${-heading}deg)` }}>
        {Array.from({ length: 24 }, (_, i) => (
          <line
            key={i}
            y1="-42"
            y2={i % 6 === 0 ? "-36" : "-39"}
            transform={`rotate(${i * 15})`}
            className="stroke-white/40"
            strokeWidth={i % 6 === 0 ? 1.5 : 1}
          />
        ))}
        {letters.map(({ label, angle, north }) => (
          <text
            key={angle}
            y="-24"
            transform={`rotate(${angle})`}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="700"
            className={north ? "fill-summit-500" : "fill-white/70"}
          >
            {label}
          </text>
        ))}
      </g>
      <path d="M0 -46 L5 -37 L-5 -37 Z" className="fill-summit-500" />
      <circle r="2.5" className="fill-white/80" />
    </svg>
  );
}
