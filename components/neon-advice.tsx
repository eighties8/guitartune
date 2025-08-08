'use client'

import { cn } from "@/lib/utils"

type Variant = "ok" | "warn" | "muted"

export function NeonAdvice({
  cents = 0,
  message = "Play a string",
  variant = "muted",
}: {
  cents?: number
  message?: string
  variant?: Variant
}) {
  const ring =
    variant === "ok"
      ? "from-emerald-400 via-lime-300 to-emerald-500"
      : variant === "warn"
      ? "from-amber-400 via-yellow-300 to-orange-500"
      : "from-zinc-400 via-zinc-300 to-zinc-500"

  const pill =
    variant === "ok"
      ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/40"
      : variant === "warn"
      ? "bg-amber-400/10 text-amber-200 border-amber-400/40"
      : "bg-neutral-800/70 text-neutral-300 border-neutral-600/40"

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12">
        {/* Glow ring */}
        <div className={cn("absolute inset-0 rounded-full blur-[6px] bg-gradient-to-tr", ring)} />
        {/* Ring stroke */}
        <div className={cn("absolute inset-0 rounded-full bg-gradient-to-tr p-[2px]", ring)}>
          <div className="h-full w-full rounded-full bg-neutral-950" />
        </div>
        {/* Value */}
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-neutral-100">
          {cents > 0 ? `+${cents}` : `${cents}`}
        </div>
        {/* Tiny pointer */}
        <div
          className={cn(
            "absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-950 border",
            variant === "ok" ? "border-emerald-400/40" : variant === "warn" ? "border-amber-400/40" : "border-neutral-600/40"
          )}
        />
      </div>
      <div className={cn("rounded-full border px-3 py-2 text-xs backdrop-blur-sm", pill)}>{message}</div>
    </div>
  )
}
