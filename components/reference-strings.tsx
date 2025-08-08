'use client'

import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from "react"
import { type PresetDefinition } from "@/lib/tuning-presets"

type Props = {
  tuning: PresetDefinition
  volumeOn?: boolean
  onToggleVolume?: () => void
  calibration?: number
}

export function ReferenceStrings({
  tuning,
  volumeOn = true,
  onToggleVolume = () => {},
  calibration = 440,
}: Props) {
  const ctxRef = useRef<AudioContext | null>(null)
  const oscsRef = useRef<Record<string, OscillatorNode>>({})
  const gainsRef = useRef<Record<string, GainNode>>({})

  useEffect(() => {
    return () => {
      stopAll()
      ctxRef.current?.close()
      ctxRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startTone = async (id: string, hz: number) => {
    if (!volumeOn) return
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
    const ctx = ctxRef.current ?? new Ctx()
    ctxRef.current = ctx

    stopTone(id)

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = hz
    gain.gain.value = 0.001
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    oscsRef.current[id] = osc
    gainsRef.current[id] = gain

    // ramp up
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.05)
  }

  const stopTone = (id: string) => {
    const osc = oscsRef.current[id]
    const gain = gainsRef.current[id]
    const ctx = ctxRef.current
    if (osc && gain && ctx) {
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
        osc.stop(ctx.currentTime + 0.06)
      } catch {}
    }
    delete oscsRef.current[id]
    delete gainsRef.current[id]
  }

  const stopAll = () => {
    Object.keys(oscsRef.current).forEach(stopTone)
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{tuning.label}</div>
        <Button variant="outline" size="icon" onClick={onToggleVolume} aria-label={volumeOn ? "Mute" : "Unmute"}>
          {volumeOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {tuning.strings.map((s) => (
          <button
            key={s.id}
            onMouseDown={() => startTone(s.id, s.hz)}
            onTouchStart={() => startTone(s.id, s.hz)}
            onMouseUp={() => stopTone(s.id)}
            onMouseLeave={() => stopTone(s.id)}
            onTouchEnd={() => stopTone(s.id)}
            className="rounded-lg border bg-white px-4 py-3 text-left hover:bg-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="text-sm font-semibold">{s.label}</div>
            <div className="text-xs text-muted-foreground">{s.hz.toFixed(2)} Hz</div>
          </button>
        ))}
      </div>
      <button onClick={stopAll} className="text-xs text-muted-foreground underline underline-offset-4 justify-self-start">
        Stop all
      </button>
    </div>
  )
}
