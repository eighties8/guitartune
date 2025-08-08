'use client'

import { cn } from "@/lib/utils"

export function AdviceBubble({
  cents = 0,
  message = "Play a string",
  variant = "muted",
}: {
  cents?: number
  message?: string
  variant?: "ok" | "warn" | "muted"
}) {
  const badgeStyles =
    variant === "ok"
      ? "border-emerald-400 text-emerald-300"
      : variant === "warn"
      ? "border-amber-400 text-amber-300"
      : "border-neutral-600 text-neutral-300"

  const pillStyles =
    variant === "ok"
      ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40"
      : variant === "warn"
      ? "bg-amber-500/15 text-amber-200 border-amber-400/40"
      : "bg-neutral-800/70 text-neutral-300 border-neutral-600/40"

  return (
    <div className="flex items-center gap-3">
      <div className={cn("relative flex h-12 w-12 items-center justify-center rounded-full border", badgeStyles)}>
        <span className="text-sm font-semibold">{cents > 0 ? `+${cents}` : `${cents}`}</span>
        <div
          className={cn(
            "absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r",
            badgeStyles
          )}
          style={{ background: "transparent" }}
        />
      </div>

      <div className={cn("rounded-full border px-3 py-2 text-xs", pillStyles)}>
        {message}
      </div>
    </div>
  )
}
