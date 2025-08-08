"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Square, Volume2 } from 'lucide-react'
import { midiToFrequency } from "@/lib/music"

type Waveform = OscillatorType

export function ReferenceTone({
  frequency = 440,
  a4 = 440,
  defaultVolume = 0.15,
  defaultWaveform = "sine",
}: {
  frequency?: number
  a4?: number
  defaultVolume?: number
  defaultWaveform?: Waveform
}) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState(defaultVolume)
  const [wave, setWave] = React.useState<Waveform>(defaultWaveform)
  const ctxRef = React.useRef<AudioContext | null>(null)
  const oscRef = React.useRef<OscillatorNode | null>(null)
  const gainRef = React.useRef<GainNode | null>(null)

  React.useEffect(() => {
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function ensureContext() {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      await ctx.resume()
      ctxRef.current = ctx
    }
    return ctxRef.current!
  }

  function stop() {
    try {
      const now = ctxRef.current?.currentTime ?? 0
      if (gainRef.current && now) {
        gainRef.current.gain.cancelScheduledValues(now)
        gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now)
        gainRef.current.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
      }
      oscRef.current?.stop(ctxRef.current!.currentTime + 0.09)
    } catch {}
    oscRef.current?.disconnect()
    gainRef.current?.disconnect()
    oscRef.current = null
    gainRef.current = null
    setIsPlaying(false)
  }

  async function play() {
    const ctx = await ensureContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.value = Math.max(0.0001, volume)
    osc.type = wave
    osc.frequency.value = frequency

    osc.connect(gain).connect(ctx.destination)
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.06)
    osc.start()
    oscRef.current = osc
    gainRef.current = gain
    setIsPlaying(true)
  }

  React.useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(Math.max(0.0001, volume), ctxRef.current.currentTime, 0.05)
    }
  }, [volume])

  React.useEffect(() => {
    if (oscRef.current) {
      oscRef.current.type = wave
    }
  }, [wave])

  React.useEffect(() => {
    if (oscRef.current) {
      oscRef.current.frequency.setTargetAtTime(frequency, ctxRef.current!.currentTime, 0.05)
    }
  }, [frequency, a4])

  return (
    <div className="rounded-md border border-zinc-200 p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={isPlaying ? stop : play} aria-pressed={isPlaying}>
            {isPlaying ? (
              <>
                <Square className="mr-2 h-4 w-4" aria-hidden="true" />
                Stop
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                Play
              </>
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-zinc-600" aria-hidden="true" />
            <Slider
              min={0}
              max={0.5}
              step={0.01}
              value={[volume]}
              onValueChange={(v) => setVolume(v[0] ?? 0.15)}
              className="w-40"
              aria-label="Reference tone volume"
            />
          </div>
        </div>
        <div className="grid gap-1">
          <Label htmlFor="wave">Waveform</Label>
          <Select defaultValue={wave} onValueChange={(v) => setWave(v as Waveform)}>
            <SelectTrigger id="wave" className="w-[160px]">
              <SelectValue placeholder="Waveform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sine">Sine</SelectItem>
              <SelectItem value="triangle">Triangle</SelectItem>
              <SelectItem value="sawtooth">Sawtooth</SelectItem>
              <SelectItem value="square">Square</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
