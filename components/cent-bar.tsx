'use client'

import { cn } from "@/lib/utils"

type Props = {
  cents?: number
  inTune?: boolean
}

export function CentBar({ cents = 0, inTune = false }: Props) {
  const c = Math.max(-50, Math.min(50, isFinite(cents) ? cents : 0))
  const pct = (c + 50) / 100 // 0..1
  return (
    <div className="w-full">
      <div
        className="relative h-3 w-full overflow-hidden rounded-full"
        style={{
          background:
            "linear-gradient(90deg, #f43f5e 0%, #f59e0b 35%, #10b981 50%, #f59e0b 65%, #f43f5e 100%)",
        }}
        aria-label="Cents deviation meter"
      >
        <div
          className={cn(
            "absolute -top-1 h-5 w-5 -translate-x-1/2 rounded-full border transition-transform duration-150",
            inTune ? "border-emerald-400 bg-emerald-400/20" : "border-neutral-300 bg-white/20"
          )}
          style={{ left: `${pct * 100}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
        <span>-50</span>
        <span>0</span>
        <span>+50</span>
      </div>
    </div>
  )
}
