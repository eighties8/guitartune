"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function TuningMeter({
  cents = 0,
  active = false,
  targetHz,
  currentHz,
}: {
  cents?: number
  active?: boolean
  targetHz?: number
  currentHz?: number
}) {
  const clamped = Math.max(-50, Math.min(50, cents))
  const pct = ((clamped + 50) / 100) * 100 // 0..100

  const color =
    !active
      ? "bg-zinc-200"
      : Math.abs(cents) <= 5
        ? "bg-emerald-600"
        : Math.abs(cents) <= 15
          ? "bg-amber-500"
          : "bg-rose-600"

  return (
    <div>
      <div
        className={cn(
          "relative h-14 w-full rounded-md border border-zinc-200 bg-zinc-50"
        )}
        role="img"
        aria-label={`Tuning meter. ${Math.abs(cents).toFixed(1)} cents ${cents > 0 ? "sharp" : "flat"}.`}
      >
        {/* center line */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-zinc-300" />
        {/* ticks */}
        {[-40, -30, -20, -10, 10, 20, 30, 40].map((t) => (
          <div
            key={t}
            className="absolute top-0 h-full w-px bg-zinc-200"
            style={{ left: `${((t + 50) / 100) * 100}%` }}
          />
        ))}
        {/* pointer */}
        <div
          className={cn(
            "absolute top-0 h-full w-1 rounded-sm transition-[left] duration-150 ease-out",
            color
          )}
          style={{ left: `calc(${pct}% - 2px)` }}
        />
        {/* bounds labels */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-between px-2 pb-1 text-[10px] text-zinc-500">
          <span>-50¢</span>
          <span>0¢</span>
          <span>+50¢</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
        <span>
          {typeof currentHz === "number" ? `${currentHz.toFixed(2)} Hz` : "—"}
        </span>
        <span>
          Target {typeof targetHz === "number" ? `${targetHz.toFixed(2)} Hz` : "—"}
        </span>
      </div>
    </div>
  )
}
