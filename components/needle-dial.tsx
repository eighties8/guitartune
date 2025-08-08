'use client'

type Props = {
  cents: number // -50..+50
  inTune?: boolean
}

export default function NeedleDial({ cents, inTune = false }: Props) {
  const c = Math.max(-50, Math.min(50, isFinite(cents) ? cents : 0))
  const angle = (c / 50) * 45 // -45..+45 deg

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-[58%] scale-90"
      style={{ marginTop: -30 }} // nudge up ~30px
      aria-label="Analog tuning dial"
    >
      <svg width="220" height="160" viewBox="0 0 220 160">
        <defs>
          <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f43f5e" />
            <stop offset="0.5" stopColor="#10b981" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {/* Outer arc (thinner) */}
        <path d={describeArc(110, 120, 90, 200, -20)} fill="none" stroke="url(#dialGrad)" strokeWidth="8" opacity="0.45" strokeLinecap="round" />
        {/* Center green band (thinner) */}
        <path d={describeArc(110, 120, 90, -8, 8)} fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
        {[-50, -25, 0, 25, 50].map((t) => {
          const r1 = polarToCartesian(110, 120, 88, (t / 50) * 45)
          const r2 = polarToCartesian(110, 120, 72, (t / 50) * 45)
          return <line key={t} x1={r1.x} y1={r1.y} x2={r2.x} y2={r2.y} stroke="#64748b" strokeWidth={t === 0 ? 3 : 2} />
        })}
        <g transform={`rotate(${angle},110,120)`}>
          {/* Needle thinner */}
          <line x1="110" y1="120" x2="110" y2="34" stroke={inTune ? "#10b981" : "#e5e7eb"} strokeWidth="3" strokeLinecap="round" />
          <circle cx="110" cy="120" r="6" fill={inTune ? "#10b981" : "#e5e7eb"} />
        </g>
      </svg>
    </div>
  )
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}
function describeArc(x: number, y: number, r: number, start: number, end: number) {
  const s = polarToCartesian(x, y, r, end)
  const e = polarToCartesian(x, y, r, start)
  const large = end - start <= 180 ? 0 : 1
  return ["M", s.x, s.y, "A", r, r, 0, large, 0, e.x, e.y].join(" ")
}
