export default function AfricanDivider({ bg = "#0B1120" }: { bg?: string }) {
  const large = Array.from({ length: 73 }, (_, i) => i);
  const small = Array.from({ length: 91 }, (_, i) => i);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 80 }}>
      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${bg}, transparent)` }} />
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to left, ${bg}, transparent)` }} />

      <svg viewBox="0 0 1440 80" preserveAspectRatio="xMidYMid slice"
        className="w-full h-full" xmlns="http://www.w3.org/2000/svg">

        {/* ── Top rule ── */}
        <line x1="0" y1="0.5" x2="1440" y2="0.5" stroke="#F97316" strokeOpacity="0.5" />

        {/* ── Row 1 : small upward triangles ── */}
        {small.map(i => (
          <path key={`st${i}`}
            d={`M${i * 16} 16 L${i * 16 + 8} 0 L${i * 16 + 16} 16Z`}
            fill="#F97316" fillOpacity={[0.30, 0.15, 0.22][i % 3]} />
        ))}

        {/* ── Separator ── */}
        <line x1="0" y1="16" x2="1440" y2="16" stroke="#2563EB" strokeOpacity="0.25" />

        {/* ── Row 2 : large interlocked triangles ── */}
        {large.map(i => (
          <path key={`lu${i}`}
            d={`M${i * 20} 64 L${i * 20 + 10} 16 L${i * 20 + 20} 64Z`}
            fill="#F97316" fillOpacity={[0.35, 0.18, 0.28][i % 3]} />
        ))}
        {large.map(i => (
          <path key={`ld${i}`}
            d={`M${i * 20 - 10} 16 L${i * 20 + 10} 16 L${i * 20} 64Z`}
            fill="#2563EB" fillOpacity={[0.32, 0.16, 0.24][i % 3]} />
        ))}
        {/* Center diamonds */}
        {large.map(i => (
          <path key={`cd${i}`}
            d={`M${i * 20 + 10} 34 L${i * 20 + 15} 40 L${i * 20 + 10} 46 L${i * 20 + 5} 40Z`}
            fill="#F97316" fillOpacity={0.6} />
        ))}

        {/* ── Separator ── */}
        <line x1="0" y1="64" x2="1440" y2="64" stroke="#2563EB" strokeOpacity="0.25" />

        {/* ── Row 3 : small downward triangles ── */}
        {small.map(i => (
          <path key={`sb${i}`}
            d={`M${i * 16} 64 L${i * 16 + 16} 64 L${i * 16 + 8} 80Z`}
            fill="#2563EB" fillOpacity={[0.28, 0.14, 0.20][i % 3]} />
        ))}

        {/* ── Bottom rule ── */}
        <line x1="0" y1="79.5" x2="1440" y2="79.5" stroke="#F97316" strokeOpacity="0.5" />
      </svg>
    </div>
  );
}
