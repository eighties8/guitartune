'use client'

import { cn } from "@/lib/utils"
import { Check } from 'lucide-react'

type Props = {
  cents: number
  noteLetter: string
  noteOctave?: string | number
  hasSignal: boolean
  inTune: boolean
  message: string
  // Absolute Y (px) where the center line starts (we'll center horizontally with CSS)
  top?: number | null
  showCheck?: boolean
  // Scales the whole indicator for responsiveness
  scale?: number
}

export function CenterIndicator({
  cents,
  noteLetter,
  noteOctave,
  hasSignal,
  inTune,
  message,
  top = 56,
  showCheck = false,
  scale = 1,
}: Props) {
  const c = Math.round(cents)
  const ok = inTune && hasSignal
  const ring = ok ? "from-emerald-400 via-emerald-300 to-teal-400" : "from-zinc-500 via-zinc-400 to-zinc-600"

  // Keep note pill steady by fixing the line height
  const LINE_HEIGHT = 14

  return (
    <div
      className="absolute z-30 left-1/2 select-none"
      style={{ top: top ?? 56, transform: `translateX(-50%) scale(${Number.isFinite(scale) ? scale : 1})` }}
    >
      {/* Helper text - moved above badge */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 -top-12 inline-flex items-center whitespace-nowrap rounded-full border px-3 py-2 text-xs backdrop-blur",
          ok
            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
            : hasSignal
            ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
            : "border-neutral-600/40 bg-neutral-800/70 text-neutral-300"
        )}
      >
        {message}
      </div>

      {/* Badge row */}
      <div className="relative mx-auto" style={{ width: `${44 * scale}px` }}>
        {/* Badge */}
        <div className="relative" style={{ width: `${44 * scale}px`, height: `${44 * scale}px` }}>
          <div className={cn("absolute inset-0 rounded-full blur-[6px] bg-gradient-to-tr opacity-60", ring)} />
          <div className={cn("absolute inset-0 rounded-full bg-gradient-to-tr p-[2px]", ring)}>
            <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-950">
              {ok ? (
                <Check className="text-emerald-300" style={{ width: `${16 * scale}px`, height: `${16 * scale}px` }} />
              ) : (
                <span className="font-semibold text-neutral-100" style={{ fontSize: `${14 * scale}px` }}>
                  {hasSignal ? (c > 0 ? `+${c}` : `${c}`) : "0"}
                </span>
              )}
            </div>
          </div>
          <div
            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: `${6 * scale}px solid transparent`,
              borderRight: `${6 * scale}px solid transparent`,
              borderTop: `${8 * scale}px solid #0a0a0a`,
            }}
          />
        </div>
      </div>

      {/* Vertical line */}
      <div
        aria-hidden="true"
        className="mx-auto mt-2 w-px"
        style={{ height: LINE_HEIGHT * scale, background: "linear-gradient(to bottom, rgba(255,255,255,0.35), rgba(255,255,255,0.1))" }}
      />

      {/* Note pill */}
      <div
        className={cn(
          "mx-auto mt-2 w-max rounded-full border px-5 py-2 text-center backdrop-blur",
          ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/6 text-neutral-100"
        )}
      >
        <div className="flex items-center justify-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-semibold leading-none text-current" style={{ fontSize: `${28 * scale}px` }}>{noteLetter || "—"}</span>
            {noteOctave ? <span className="leading-none text-current" style={{ fontSize: `${18 * scale}px` }}>{String(noteOctave)}</span> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
