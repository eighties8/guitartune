'use client'

import React from "react"

type GaugeProps = {
  cents?: number
  inTune?: boolean
  width?: number
  height?: number
}

export function Gauge({
  cents = 0,
  inTune = false,
  width = 420, // slightly narrower by default
  height = 210
}: GaugeProps) {
  const c = Math.max(-50, Math.min(50, isFinite(cents) ? cents : 0))
  const minAngle = -50
  const maxAngle = 50
  const angle = ((c - (-50)) / (100)) * (maxAngle - minAngle) + minAngle

  const centerX = width / 2
  const centerY = height - 10

  return (
    <div className="w-full" style={{ marginTop: -30 }}>
      <svg
        role="img"
        aria-label="Tuning gauge"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto block"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Arc background thinner */}
        <path
          d={describeArc(centerX, centerY, Math.min(centerX, centerY) - 14, 200, -20)}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Center green band thinner */}
        <path
          d={describeArc(centerX, centerY, Math.min(centerX, centerY) - 14, -7, 7)}
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {[-50, -25, 0, 25, 50].map((t) => {
          const a = t
          const r = Math.min(centerX, centerY) - 14
          const p1 = polarToCartesian(centerX, centerY, r - 2, a)
          const p2 = polarToCartesian(centerX, centerY, r - 22, a)
          return (
            <line
              key={t}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#64748b"
              strokeWidth={t === 0 ? 3 : 2}
            />
          )
        })}

        {/* Needle thinner */}
        <g transform={`rotate(${angle}, ${centerX}, ${centerY})`}>
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX}
            y2={centerY - (Math.min(centerX, centerY) - 30)}
            stroke={inTune ? "#10b981" : "#0f172a"}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={centerX} cy={centerY} r="8" fill={inTune ? "#10b981" : "#0f172a"} />
        </g>

        {/* Labels */}
        <text x={centerX} y={centerY - 12} textAnchor="middle" className="fill-stone-500" fontSize="12">
          {"-50"}
        </text>
        <text x={centerX} y={centerY - (Math.min(centerX, centerY) - 38)} textAnchor="middle" className="fill-stone-600" fontSize="12" fontWeight={600}>
          {"0"}
        </text>
        <text x={width - 40} y={centerY - 12} textAnchor="end" className="fill-stone-500" fontSize="12">
          {"+50"}
        </text>
      </svg>
    </div>
  )
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  const d = ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ")
  return d
}
