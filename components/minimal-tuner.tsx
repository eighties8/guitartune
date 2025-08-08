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

const DEFAULT_PEG_SIZE = 64
const PEG_Y_OFFSET = -49
const HYSTERESIS_CENTS = 15
const DETECT_HOLD_MS = 1200
const CHECK_HOLD_RINGING_MS = 1800
const CHECK_HOLD_AFTER_STOP_MS = 1200

// Vertical anchor: set slightly above the headstock tip
const LINE_START_OFFSET_FROM_TIP = -14 // px relative to the headstock tip (negative = above)

export default function MinimalTuner() {
  const [mode, setMode] = useState<Mode>("auto")
  const [dial, setDial] = useState(true)
  const [listening, setListening] = useState(false)
  const [manualModeMessage, setManualModeMessage] = useState(false)
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
  const [activeLabel, setActiveLabel] = useState<string | null>(null)
  useEffect(() => {
    // Only set active label when there's actual frequency input
    if (frequency && !activeLabel) {
      const candidate = sortedStrings.reduce(
        (best, s) => (Math.abs(frequency - s.hz) < Math.abs(frequency - best.hz) ? s : best),
        sortedStrings[0]
      )
      setActiveLabel(candidate.label)
    }
  }, [frequency, preset, activeLabel, sortedStrings])

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
  const helper = manualModeMessage ? "Manual mode activated" : !hasSignalHeld ? "Play a string" : inTuneNow ? "In tune" : uiCents < 0 ? "Tune up" : "Tune down"

  // Reference tone (press-and-hold)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => () => stopTone(), [])
  
  const startTone = async (note: string) => {
    try {
      stopTone()
      const audio = new Audio(`/sounds/${note}.mp3`)
      audio.volume = 0.5
      audio.loop = false
      await audio.play()
      audioRef.current = audio
      
      // Auto-cleanup when audio finishes
      audio.onended = () => {
        audioRef.current = null
      }
    } catch (error) {
      console.error('Error starting tone:', error)
    }
  }
  
  const stopTone = () => {
    const audio = audioRef.current
    if (audio) {
      try {
        audio.pause()
        audio.currentTime = 0
        audio.loop = false
      } catch (error) {
        console.error('Error stopping tone:', error)
      }
    }
    audioRef.current = null
  }

  // Layout measurement for peg alignment and indicator vertical placement only
  const stageRef = useRef<HTMLDivElement | null>(null)
  const headRef = useRef<HTMLDivElement | null>(null)
  const [pegCoords, setPegCoords] = useState<Record<string, { left: number; top: number }>>({})
  const [indicatorTop, setIndicatorTop] = useState<number | null>(null)
  const [pegSize, setPegSize] = useState<number>(DEFAULT_PEG_SIZE)
  const [indicatorScale, setIndicatorScale] = useState<number>(1)

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

      // Responsive derived sizes
      const nextPegSize = Math.max(46, Math.min(84, Math.round(stageRect.width * 0.18)))
      // Gap from headstock edge to peg center
      const gap = Math.max(6, Math.min(16, stageRect.width * 0.022))
      setPegSize(nextPegSize)
      setIndicatorScale(Math.max(0.85, Math.min(1.1, stageRect.width / 430)))

      // Peg positions (centered by current peg size)
      const coords: Record<string, { left: number; top: number }> = {}
      PEGS.forEach((p) => {
        const yCenter = topEdge + height * p.pctY + PEG_Y_OFFSET
        const xCenter = p.side === "left" ? leftEdge - gap : rightEdge + gap
        coords[p.label] = { left: xCenter - nextPegSize / 2, top: yCenter }
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
    <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 pt-0 pb-1 sm:py-6">
      {/* Header */}
      <div className="mb-0 sm:mb-4 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-10 sm:size-16 md:size-20 flex items-center justify-center shrink-0">
            <Image
              src="/images/guitar-tune-alt.webp"
              alt="GuitarTune Logo"
              width={80}
              height={80}
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="text-base sm:text-xl font-bold text-white truncate">Guitar Tune</h1>
        </div>
        <div className="flex w-full sm:w-auto flex-wrap items-center gap-3 sm:gap-6 justify-center sm:justify-end">
          <div className="text-right hidden sm:block">
            <div className="text-sm sm:text-base font-semibold tracking-wide">Guitar 6‑string</div>
            <div className="text-[10px] sm:text-xs text-neutral-400">Standard (E A D G B E)</div>
          </div>

          {/* Switches */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs text-neutral-400">AUTO</span>
              <Switch className="cursor-pointer" checked={mode === "auto"} onCheckedChange={(v) => setMode(v ? "auto" : "manual")} />
              <span
                className={cn(
                  "rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium",
                  mode === "auto"
                    ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-neutral-800 text-neutral-300 border border-white/10"
                )}
              >
                {mode === "auto" ? "ON" : "OFF"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs text-neutral-400">DIAL</span>
              <Switch className="cursor-pointer" checked={dial} onCheckedChange={setDial} />
              <span
                className={cn(
                  "rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium",
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
              "z-10 gap-2 rounded-full px-3 sm:px-4 cursor-pointer h-8 sm:h-9 hidden sm:inline-flex sm:my-1",
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

      {/* Centered mobile mic button */}
      <div className="sm:hidden flex justify-center my-3">
        <Button
          onClick={toggleMic}
          className={cn(
            "z-10 gap-2 rounded-full px-4 cursor-pointer h-9 my-2",
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

      {/* Stage */}
      <div
        ref={stageRef}
        className="relative mx-auto aspect-[9/12] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl border border-neutral-800 -mt-1 sm:mt-0"
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
          scale={indicatorScale}
        />

        {/* Optional analog dial */}
        {dial && <NeedleDial cents={uiCents} inTune={inTuneNow} />}

        {/* Headstock */}
        <div
          ref={headRef}
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[56%] sm:-translate-y-[42%] w-[76%] sm:w-[76%] max-w-[411px]"
        >
          <Image
            src="/images/guitar-head.png"
            alt="Guitar headstock"
            width={411}
            height={607}
            priority
            className="pointer-events-none select-none object-contain w-full h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
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
          // Use responsive peg size derived from stage
          const size = pegSize
          const style = pos
            ? { left: `${pos.left}px`, top: `${pos.top}px`, width: size, height: size }
            : { left: fallbackLeft, top: `${p.pctY * 100}%`, width: size, height: size }

          return (
            <button
              key={s.label}
              onClick={() => {
                setSelected(s.label)
                if (mode === "auto") {
                  setMode("manual")
                  setManualModeMessage(true)
                  setTimeout(() => setManualModeMessage(false), 3000)
                }
                startTone(s.label)
              }}
              className={cn(
                "group absolute z-40 flex -translate-y-1/2 items-center justify-center rounded-full border font-semibold transition-all cursor-pointer",
                isActive
                  ? "border-emerald-500 bg-emerald-500 text-black shadow-[0_0_0_2px_rgba(16,185,129,0.35),0_0_40px_rgba(16,185,129,0.25)]"
                   : "border-white bg-white/5 text-neutral-100 backdrop-blur hover:bg-white/10"
              )}
              style={style as any}
              aria-pressed={isActive}
              aria-label={`Reference ${s.label}`}
            >
              <span style={{ fontSize: Math.round(size * 0.38) }}>{letter}</span>
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
