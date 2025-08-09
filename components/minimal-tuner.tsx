'use client'

import Image from "next/image"
import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMicTuner } from "@/hooks/use-mic-tuner"
import { type PresetDefinition, getPreset } from "@/lib/tuning-presets"
import { normalizeCents } from "@/lib/tuner-math"
import { Mic, MicOff, Gauge, Sparkles } from 'lucide-react'
import { CenterIndicator } from "./center-indicator"
import NeedleDial from "./needle-dial"

// ────────────────────────────────────────────────────────────────────────────────
// Types / constants
// ────────────────────────────────────────────────────────────────────────────────
type Mode = "auto" | "manual"

type Peg = {
  label: "E2" | "A2" | "D3" | "G3" | "B3" | "E4"
  side: "left" | "right"
  pctY: number // 0..1 of headstock height (design space)
}

const PEGS: Peg[] = [
  { label: "D3", side: "left",  pctY: 0.315 },
  { label: "A2", side: "left",  pctY: 0.505 },
  { label: "E2", side: "left",  pctY: 0.705 },
  { label: "G3", side: "right", pctY: 0.315 },
  { label: "B3", side: "right", pctY: 0.505 },
  { label: "E4", side: "right", pctY: 0.705 },
]

// Offsets measured from the headstock rect
const PEG_Y_OFFSET_PX = -49
const LINE_START_OFFSET_FROM_TIP_PX = -26

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
  const HYSTERESIS_CENTS = 15
  const [activeLabel, setActiveLabel] = useState<string | null>(null)
  useEffect(() => {
    if (frequency && !activeLabel) {
      const candidate = sortedStrings.reduce(
        (best, s) => (Math.abs(frequency - s.hz) < Math.abs(frequency - best.hz) ? s : best),
        sortedStrings[0]
      )
      setActiveLabel(candidate.label)
    }
  }, [frequency, activeLabel, sortedStrings])

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
  useEffect(() => { latestFreqRef.current = frequency ?? null }, [frequency])
  useEffect(() => { if (frequency) lastDetectedAtRef.current = Date.now() }, [frequency])
  useEffect(() => { latestTargetHzRef.current = target.hz }, [target.hz])
  useEffect(() => {
    const alpha = 0.85
    let value = 0
    const id = setInterval(() => {
      const f = latestFreqRef.current
      const t = latestTargetHzRef.current
      const raw = normalizeCents(f && t ? 1200 * Math.log2(f / t) : 0)
      value = alpha * value + (1 - alpha) * raw
      setUiCents(value)
      setNow(Date.now())
    }, 80)
    return () => clearInterval(id)
  }, [])

  const [now, setNow] = useState(() => Date.now())
  const DETECT_HOLD_MS = 1200
  const CHECK_HOLD_RINGING_MS = 1800
  const CHECK_HOLD_AFTER_STOP_MS = 1200

  const hasSignal = !!frequency
  const hasSignalHeld = hasSignal || Date.now() - lastDetectedAtRef.current < DETECT_HOLD_MS
  const inTuneNow = hasSignalHeld && Math.abs(uiCents) <= 5

  // Sticky green check after note fades (but not when out of tune)
  const lastInTuneAtRef = useRef<number>(0)
  useEffect(() => { if (inTuneNow) lastInTuneAtRef.current = Date.now() }, [inTuneNow])

  const showCheck =
    inTuneNow ||
    (hasSignalHeld && Date.now() - lastInTuneAtRef.current < CHECK_HOLD_RINGING_MS) ||
    (!hasSignalHeld && Date.now() - lastInTuneAtRef.current < CHECK_HOLD_AFTER_STOP_MS)

  const noteLetter = target.label.replace(/[0-9]/g, "")
  const noteOct = (target.label.match(/\d+/) || [""])[0]
  const helper = manualModeMessage
    ? "Manual mode activated"
    : !hasSignalHeld
    ? "Play a string"
    : inTuneNow
    ? "In tune"
    : uiCents < 0
    ? "Tune up"
    : "Tune down"

  // Reference tone
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
      audio.onended = () => { audioRef.current = null }
    } catch (e) { console.error(e) }
  }
  const stopTone = () => {
    const a = audioRef.current
    if (a) { try { a.pause(); a.currentTime = 0; a.loop = false } catch {} }
    audioRef.current = null
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Layout (percent-based) — render only after first measure to avoid blink
  // ────────────────────────────────────────────────────────────────────────────
  const stageRef = useRef<HTMLDivElement | null>(null)
  const headRef  = useRef<HTMLDivElement | null>(null)

  type PctPos = { leftPct: number; topPct: number }
  const [pegCoordsPct, setPegCoordsPct] = useState<Record<string, PctPos>>({})
  const [indicatorTopPct, setIndicatorTopPct] = useState<number | null>(null)
  const [pegSizePct, setPegSizePct] = useState<number>(12) // % of stage width
  const [indicatorScale, setIndicatorScale] = useState<number>(1)
  const [stageW, setStageW] = useState<number>(0)          // for font-size calc
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const calc = () => {
      const stage = stageRef.current
      const head  = headRef.current
      if (!stage || !head) return

      const stageRect = stage.getBoundingClientRect()
      const headRect  = head.getBoundingClientRect()
      const stageWpx  = stageRect.width
      const stageHpx  = stageRect.height

      setStageW(stageWpx)
      setIndicatorScale(Math.max(0.85, Math.min(1.1, stageWpx / 430)))

      // Design in px, then store as %
      const nextPegSizePx = Math.max(46, Math.min(84, Math.round(stageWpx * 0.18)))
      const gapPx         = Math.max(6,  Math.min(16, stageWpx * 0.022))
      setPegSizePct((nextPegSizePx / stageWpx) * 100)

      const leftEdge  = headRect.left  - stageRect.left
      const rightEdge = headRect.right - stageRect.left
      const topEdge   = headRect.top   - stageRect.top
      const height    = headRect.height

      const coords: Record<string, PctPos> = {}
      PEGS.forEach((p) => {
        const yCenterPx = topEdge + height * p.pctY + PEG_Y_OFFSET_PX
        const xCenterPx = p.side === "left" ? leftEdge - gapPx : rightEdge + gapPx
        coords[p.label] = {
          leftPct: (xCenterPx / stageWpx) * 100,
          topPct:  (yCenterPx / stageHpx) * 100,
        }
      })
      setPegCoordsPct(coords)

      const topAnchorPx = Math.max(0, topEdge + LINE_START_OFFSET_FROM_TIP_PX)
      setIndicatorTopPct((topAnchorPx / stageHpx) * 100)

      if (!ready) setReady(true)
    }

    calc()

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => calc())
      if (stageRef.current) ro.observe(stageRef.current)
      if (headRef.current)  ro.observe(headRef.current)
    }
    const onResize = () => calc()
    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onResize)
      ro?.disconnect()
    }
  }, [ready])

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 pt-2 pb-1 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-10 sm:size-16 md:size-20 flex items-center justify-center shrink-0">
            <Image src="/images/guitar-tune-alt.webp" alt="GuitarTune Logo" width={80} height={80} className="object-contain w-full h-full" />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">Guitar Tune</h1>
            <p className="text-xs sm:text-sm text-neutral-300">The free online guitar tuner</p>
          </div>
        </div>

        <div className="flex w-full sm:w-auto flex-wrap items-center gap-2 sm:gap-3 justify-center sm:justify-end">
          <div className="text-right hidden sm:block">
            <div className="text-sm sm:text-base font-semibold tracking-wide">Guitar 6-string</div>
            <div className="text-[10px] sm:text-xs text-neutral-400">Standard (E A D G B E)</div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setMode(mode === "auto" ? "manual" : "auto")}
              className={cn(
                "z-10 gap-2 rounded-full px-4 sm:px-4 cursor-pointer h-10 sm:h-9",
                mode === "auto"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-500/90 hover:to-teal-500/90 text-black"
                  : "border border-neutral-400/70 bg-neutral-900 text-neutral-100 hover:bg-neutral-800 hover:border-neutral-200 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
              )}
              variant={mode === "auto" ? "default" : "secondary"}
            >
              <Sparkles className="h-4 w-4" />
              Auto: {mode === "auto" ? "ON" : "OFF"}
            </Button>

            <Button
              onClick={() => setDial(!dial)}
              className={cn(
                "z-10 gap-2 rounded-full px-4 sm:px-4 cursor-pointer h-10 sm:h-9",
                dial
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-500/90 hover:to-teal-500/90 text-black"
                  : "border border-neutral-400/70 bg-neutral-900 text-neutral-100 hover:bg-neutral-800 hover:border-neutral-200 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
              )}
              variant={dial ? "default" : "secondary"}
            >
              <Gauge className="h-4 w-4" />
              Dial: {dial ? "ON" : "OFF"}
            </Button>
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
            "z-10 gap-2 rounded-full px-4 cursor-pointer h-10 my-2",
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
        className="relative mx-auto w-full overflow-hidden rounded-2xl border border-neutral-800 mt-4 h-[clamp(560px,70vw,860px)]"
        style={{
          background: `radial-gradient(60% 50% at 50% 55%, rgba(168,85,247,0.12) 0%, rgba(20,20,20,0.0) 60%),
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
            #0a0a0a`,
          backgroundSize: "auto, 32px 32px, 32px 32px, auto",
          backgroundPosition: "center, center, center, center",
          height: "clamp(620px,70vw,860px)"
        }}
      >
        {/* Only render the moving UI once measured */}
        <div className={ready ? "" : "invisible"}>
          {/* Center indicator (positioned by % wrapper) */}
          {typeof indicatorTopPct === 'number' && (
            <div
              className="absolute z-30 left-1/2"
              style={{ top: `${indicatorTopPct}%`, transform: 'translateX(-50%)' }}
            >
              <CenterIndicator
                cents={uiCents}
                noteLetter={noteLetter}
                noteOctave={noteOct}
                hasSignal={hasSignalHeld}
                inTune={inTuneNow}
                message={helper}
                top={0}
                showCheck={showCheck}
                scale={indicatorScale}
              />
            </div>
          )}

          {/* Optional analog dial */}
          {dial && <NeedleDial cents={uiCents} inTune={inTuneNow} />}

          {/* Headstock */}
          <div
            ref={headRef}
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[60%] sm:-translate-y-[54%] md:-translate-y-[48%] lg:-translate-y-[44%] w-[76%] sm:w-[76%] max-w-[411px]"
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
              (mode === "manual" && selected === s.label) ||
              (mode === "auto" && activeLabel === s.label)

            const letter = s.label.replace(/[0-9]/g, "")
            const pos = pegCoordsPct[p.label]
            const fallbackLeftPct = p.side === "left" ? 30 : 70
            const style = pos
              ? { left: `${pos.leftPct}%`, top: `${pos.topPct}%`, width: `${pegSizePct}%` }
              : { left: `${fallbackLeftPct}%`, top: `${p.pctY * 100}%`, width: `${pegSizePct}%` }

            const fontPx = stageW * (pegSizePct / 100) * 0.38

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
                  "group absolute z-40 flex items-center justify-center rounded-full border font-semibold transition-all cursor-pointer",
                  "-translate-x-1/2 -translate-y-1/2 aspect-square",
                  isActive
                    ? "border-emerald-500 bg-emerald-500 text-black shadow-[0_0_0_2px_rgba(16,185,129,0.35),0_0_40px_rgba(16,185,129,0.25)]"
                    : "border-white bg-white/5 text-neutral-100 backdrop-blur hover:bg-white/10"
                )}
                style={style as any}
                aria-pressed={isActive}
                aria-label={`Reference ${s.label}`}
              >
                <span style={{ fontSize: `${Math.round(fontPx)}px` }}>{letter}</span>
              </button>
            )
          })}
        </div>

        {error && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-red-400">{error}</div>
        )}
      </div>
    </div>
  )
}