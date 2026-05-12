export default function AfricanDivider({ bg = "#0B1120" }: { bg?: string }) {
  const count = 73;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 52 }}>
      {/* Edge fades */}
      <div
        className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${bg}, transparent)` }}
      />
      <div
        className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to left, ${bg}, transparent)` }}
      />

      <svg
        viewBox="0 0 1440 52"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top rule */}
        <line x1="0" y1="0.5" x2="1440" y2="0.5" stroke="#F97316" strokeOpacity="0.5" />

        {/* Upward triangles — accent orange */}
        {Array.from({ length: count }, (_, i) => (
          <path
            key={`u${i}`}
            d={`M${i * 20} 52 L${i * 20 + 10} 26 L${i * 20 + 20} 52Z`}
            fill="#F97316"
            fillOpacity={[0.35, 0.18, 0.28][i % 3]}
          />
        ))}

        {/* Downward triangles — primary blue */}
        {Array.from({ length: count }, (_, i) => (
          <path
            key={`d${i}`}
            d={`M${i * 20 - 10} 0 L${i * 20 + 10} 0 L${i * 20} 26Z`}
            fill="#2563EB"
            fillOpacity={[0.32, 0.16, 0.24][i % 3]}
          />
        ))}

        {/* Center diamonds at intersections */}
        {Array.from({ length: count }, (_, i) => (
          <path
            key={`c${i}`}
            d={`M${i * 20 + 10} 20 L${i * 20 + 14} 26 L${i * 20 + 10} 32 L${i * 20 + 6} 26Z`}
            fill="#F97316"
            fillOpacity={0.55}
          />
        ))}

        {/* Bottom rule */}
        <line x1="0" y1="51.5" x2="1440" y2="51.5" stroke="#F97316" strokeOpacity="0.5" />
      </svg>
    </div>
  );
}
