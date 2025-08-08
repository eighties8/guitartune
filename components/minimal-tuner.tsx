'use client'

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useMicTuner } from "@/hooks/use-mic-tuner"
import { type PresetDefinition, getPreset } from "@/lib/tuning-presets"
import { normalizeCents } from "@/lib/tuner-math"
import { Mic, MicOff } from 'lucide-react'
import { CenterIndicator } from "./center-indicator"
import NeedleDial from "./needle-dial"

type Mode = "auto" | "manual"

type Peg = {
  label: "E2" | "A2" | "D3" | "G3" | "B3" | "E4"
  side: "left" | "right"
  pctY: number // 0..1 of headstock height
}

const PEGS: Peg[] = [
  { label: "D3", side: "left", pctY: 0.315 },
  { label: "A2", side: "left", pctY: 0.505 },
  { label: "E2", side: "left", pctY: 0.705 },
  { label: "G3", side: "right", pctY: 0.315 },
  { label: "B3", side: "right", pctY: 0.505 },
  { label: "E4", side: "right", pctY: 0.705 },
]

const BUBBLE_SIZE = 64
const GAP = 36
const PEG_Y_OFFSET = -49
const HYSTERESIS_CENTS = 15
const DETECT_HOLD_MS = 1200
const CHECK_HOLD_RINGING_MS = 1800
const CHECK_HOLD_AFTER_STOP_MS = 1200

// Vertical anchor: place the indicator ~10px higher than before, just over the headstock tip.
const LINE_START_OFFSET_FROM_TIP = -4 // px relative to the headstock tip (negative = slightly above)

export default function MinimalTuner() {
  const [mode, setMode] = useState<Mode>("auto")
  const [dial, setDial] = useState(true)
  const [listening, setListening] = useState(false)
  const preset: PresetDefinition = useMemo(() => getPreset("standard"), [])
  const [selected, setSelected] = useState<string | null>(null)

  const { start, stop, frequency, error } = useMicTuner({})

  const toggleMic = async () => {
    if (listening) {
      stop()
      setListening(false)
    } else {
      const ok = await start()
      setListening(ok)
    }
  }

  useEffect(() => {
    if (!selected) setSelected(preset.strings[0].label)
  }, [preset, selected])

  // Sorted strings for auto targeting
  const sortedStrings = useMemo(() => [...preset.strings].sort((a, b) => a.hz - b.hz), [preset])

  // Sticky auto-targeting with hysteresis
  const [activeLabel, setActiveLabel] = useState<string>(preset.strings[0].label)
  useEffect(() => setActiveLabel(preset.strings[0].label), [preset])

  useEffect(() => {
    if (mode !== "auto" || !frequency) return
    const candidate = sortedStrings.reduce(
      (best, s) => (Math.abs(frequency - s.hz) < Math.abs(frequency - best.hz) ? s : best),
      sortedStrings[0]
    )
    const current = sortedStrings.find((s) => s.label === activeLabel) ?? candidate
    if (candidate.label === current.label) return
    const i = sortedStrings.findIndex((s) => s.label === current.label)
    const prev = sortedStrings[i - 1]
    const next = sortedStrings[i + 1]
    const lower = prev ? Math.sqrt(prev.hz * current.hz) : 0
    const upper = next ? Math.sqrt(next.hz * current.hz) : Infinity
    const factor = Math.pow(2, HYSTERESIS_CENTS / 1200)
    if (frequency < lower / factor || frequency > upper * factor) setActiveLabel(candidate.label)
  }, [frequency, mode, sortedStrings, activeLabel])

  // Decide target
  const target = useMemo(() => {
    if (mode === "manual") return preset.strings.find((s) => s.label === selected) ?? preset.strings[0]
    return preset.strings.find((s) => s.label === activeLabel) ?? preset.strings[0]
  }, [mode, preset, selected, activeLabel])

  // Visual smoothing (EMA at ~12fps)
  const latestFreqRef = useRef<number | null>(null)
  const latestTargetHzRef = useRef<number>(target.hz)
  const lastDetectedAtRef = useRef<number>(0)
  const [uiCents, setUiCents] = useState(0)
  useEffect(() => {
    latestFreqRef.current = frequency ?? null
  }, [frequency])
  useEffect(() => {
    if (frequency) lastDetectedAtRef.current = Date.now()
  }, [frequency])
  useEffect(() => {
    latestTargetHzRef.current = target.hz
  }, [target.hz])
  useEffect(() => {
    const alpha = 0.85
    let value = 0
    const id = setInterval(() => {
      const f = latestFreqRef.current
      const t = latestTargetHzRef.current
      const raw = normalizeCents(f && t ? 1200 * Math.log2(f / t) : 0)
      value = alpha * value + (1 - alpha) * raw
      setUiCents(value)
      setNow(Date.now()) // tick for sticky timing
    }, 80)
    return () => clearInterval(id)
  }, [])

  const [now, setNow] = useState(() => Date.now())
  const hasSignal = !!frequency
  const hasSignalHeld = hasSignal || Date.now() - lastDetectedAtRef.current < DETECT_HOLD_MS
  const inTuneNow = hasSignalHeld && Math.abs(uiCents) <= 5

  // Sticky green check after note fades (but not when out of tune)
  const lastInTuneAtRef = useRef<number>(0)
  useEffect(() => {
    if (inTuneNow) lastInTuneAtRef.current = Date.now()
  }, [inTuneNow])

  const showCheck =
    inTuneNow ||
    (hasSignalHeld && Date.now() - lastInTuneAtRef.current < CHECK_HOLD_RINGING_MS) ||
    (!hasSignalHeld && Date.now() - lastInTuneAtRef.current < CHECK_HOLD_AFTER_STOP_MS)

  const noteLetter = target.label.replace(/[0-9]/g, "")
  const noteOct = target.label.match(/[0-9]+/)?.[0] ?? ""
  const helper = !hasSignalHeld ? "Play a string" : inTuneNow ? "In tune" : uiCents < 0 ? "Tune up" : "Tune down"

  // Reference tone (press-and-hold)
  const ctxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  useEffect(() => () => stopTone(), [])
  const startTone = async (hz: number) => {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    const ctx = ctxRef.current ?? new Ctx()
    ctxRef.current = ctx
    stopTone()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = hz
    gain.gain.value = 0.0001
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.06)
    oscRef.current = osc
    gainRef.current = gain
  }
  const stopTone = () => {
    const ctx = ctxRef.current
    const osc = oscRef.current
    const gain = gainRef.current
    if (ctx && osc && gain) {
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03)
        osc.stop(ctx.currentTime + 0.04)
      } catch {}
    }
    oscRef.current = null
    gainRef.current = null
  }

  // Layout measurement for peg alignment and indicator vertical placement only
  const stageRef = useRef<HTMLDivElement | null>(null)
  const headRef = useRef<HTMLDivElement | null>(null)
  const [pegCoords, setPegCoords] = useState<Record<string, { left: number; top: number }>>({})
  const [indicatorTop, setIndicatorTop] = useState<number | null>(null)

  useEffect(() => {
    const calc = () => {
      const stage = stageRef.current
      const head = headRef.current
      if (!stage || !head) return
      const stageRect = stage.getBoundingClientRect()
      const headRect = head.getBoundingClientRect()

      const leftEdge = headRect.left - stageRect.left
      const rightEdge = headRect.right - stageRect.left
      const topEdge = headRect.top - stageRect.top
      const height = headRect.height

      // Peg positions
      const coords: Record<string, { left: number; top: number }> = {}
      PEGS.forEach((p) => {
        const yCenter = topEdge + height * p.pctY + PEG_Y_OFFSET
        const xCenter = p.side === "left" ? leftEdge - GAP : rightEdge + GAP
        coords[p.label] = { left: xCenter - BUBBLE_SIZE / 2, top: yCenter }
      })
      setPegCoords(coords)

      // Vertical anchor
      setIndicatorTop(Math.max(0, topEdge + LINE_START_OFFSET_FROM_TIP))
    }

    calc()

    let ro: ResizeObserver | null = null
    const RO = (window as any).ResizeObserver as typeof ResizeObserver | undefined
    if (RO) {
      ro = new RO(calc)
      if (stageRef.current) ro.observe(stageRef.current)
      if (headRef.current) ro.observe(headRef.current)
    }
    window.addEventListener("resize", calc)
    window.addEventListener("orientationchange", calc)
    return () => {
      window.removeEventListener("resize", calc)
      window.removeEventListener("orientationchange", calc)
      ro?.disconnect()
    }
  }, [])

  return (
    <div className="relative mx-auto max-w-[1200px] px-6 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-20 h-20 flex items-center justify-center">
            <Image
              src="/images/guitar-tune.webp"
              alt="GuitarTune Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold text-white">guitartune.app</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-base font-semibold tracking-wide">Guitar 6‑string</div>
            <div className="text-xs text-neutral-400">Standard (E A D G B E)</div>
          </div>

          {/* Switches */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">AUTO</span>
              <Switch className="cursor-pointer" checked={mode === "auto"} onCheckedChange={(v) => setMode(v ? "auto" : "manual")} />
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  mode === "auto"
                    ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-neutral-800 text-neutral-300 border border-white/10"
                )}
              >
                {mode === "auto" ? "ON" : "OFF"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">DIAL</span>
              <Switch className="cursor-pointer" checked={dial} onCheckedChange={setDial} />
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  dial ? "bg-sky-600/20 text-sky-300 border border-sky-500/40" : "bg-neutral-800 text-neutral-300 border border-white/10"
                )}
              >
                {dial ? "ON" : "OFF"}
              </span>
            </div>
          </div>

          <Button
            onClick={toggleMic}
            className={cn(
              "z-10 gap-2 rounded-full px-4 cursor-pointer",
              listening
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-500/90 hover:to-teal-500/90 text-black"
                : "border border-neutral-400/70 bg-neutral-900 text-neutral-100 hover:bg-neutral-800 hover:border-neutral-200 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
            )}
            variant={listening ? "default" : "secondary"}
          >
            {listening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            {listening ? "Listening" : "Tap to tune"}
          </Button>
        </div>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        className="relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-2xl border border-neutral-800"
        style={{
          background: `radial-gradient(60% 50% at 50% 55%, rgba(168,85,247,0.12) 0%, rgba(20,20,20,0.0) 60%),
           linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
           linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
           #0a0a0a`,
          backgroundSize: "auto, 32px 32px, 32px 32px, auto",
          backgroundPosition: "center, center, center, center",
        }}
      >
        {/* Center indicator */}
        <CenterIndicator
          cents={uiCents}
          noteLetter={noteLetter}
          noteOctave={noteOct}
          hasSignal={hasSignalHeld}
          inTune={inTuneNow}
          message={helper}
          top={indicatorTop ?? 56}
          showCheck={showCheck}
        />

        {/* Optional analog dial */}
        {dial && <NeedleDial cents={uiCents} inTune={inTuneNow} />}

        {/* Headstock */}
        <div
          ref={headRef}
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[42%]"
          style={{ width: 411, height: 607 }}
        >
          <Image
            src="/images/guitar-head.png"
            alt="Guitar headstock"
            width={411}
            height={607}
            priority
            className="pointer-events-none select-none object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
          />
        </div>

        {/* Peg indicators */}
        {PEGS.map((p) => {
          const s = preset.strings.find((x) => x.label === p.label)!
          const isActive =
            (mode === "manual" && selected === s.label) || (mode === "auto" && activeLabel === s.label)
          const letter = s.label.replace(/[0-9]/g, "")
          const pos = pegCoords[p.label]
          const fallbackLeft = p.side === "left" ? "30%" : "70%"
          const style = pos
            ? { left: `${pos.left}px`, top: `${pos.top}px` }
            : { left: fallbackLeft, top: `${p.pctY * 100}%` }

          return (
            <button
              key={s.label}
              onClick={() => {
                setSelected(s.label)
                if (mode === "auto") setMode("manual")
              }}
              onMouseDown={() => startTone(s.hz)}
              onTouchStart={() => startTone(s.hz)}
              onMouseUp={stopTone}
              onMouseLeave={stopTone}
              onTouchEnd={stopTone}
              className={cn(
                "group absolute z-40 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border text-lg font-semibold transition-all",
                isActive
                  ? "border-emerald-500 bg-emerald-500 text-black shadow-[0_0_0_2px_rgba(16,185,129,0.35),0_0_40px_rgba(16,185,129,0.25)]"
                  : "border-white/15 bg-white/5 text-neutral-100 backdrop-blur hover:bg-white/10"
              )}
              style={style as any}
              aria-pressed={isActive}
              aria-label={`Reference ${s.label}`}
            >
              {letter}
            </button>
          )
        })}

        {error && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-red-400">{error}</div>
        )}
      </div>
    </div>
  )
}
