"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Mic, MicOff, Play, Square, Volume2, BellRingIcon as TuningFork, Info, Settings } from 'lucide-react'
import { detectPitch } from "@/lib/pitch"
import { centsOffFromPitch, frequencyToNote, midiToFrequency, noteNameFromMidi } from "@/lib/music"
import { ReferenceTone } from "./reference-tone"
import { TuningMeter } from "./tuning-meter"

type StringId = "E2" | "A2" | "D3" | "G3" | "B3" | "E4"

const STANDARD_TUNING: Record<StringId, number> = {
  E2: 82.4069,
  A2: 110.0,
  D3: 146.832,
  G3: 195.998,
  B3: 246.942,
  E4: 329.628,
}

const STRING_ORDER: StringId[] = ["E2", "A2", "D3", "G3", "B3", "E4"]

export function Tuner() {
  const [isListening, setIsListening] = React.useState(false)
  const [isMicAllowed, setIsMicAllowed] = React.useState<boolean | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [sampleRate, setSampleRate] = React.useState<number>(44100)
  const [frequency, setFrequency] = React.useState<number | null>(null)
  const [rms, setRms] = React.useState<number>(0)
  const [a4, setA4] = React.useState<number>(440) // calibration
  const [smoothing, setSmoothing] = React.useState<number>(0.6) // 0..0.95
  const [selectedString, setSelectedString] = React.useState<StringId>("E2")
  const [autoMode, setAutoMode] = React.useState<boolean>(true) // auto select nearest note vs target string
  const rafRef = React.useRef<number | null>(null)
  const ctxRef = React.useRef<AudioContext | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const bufRef = React.useRef<Float32Array | null>(null)
  const smoothFreqRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      stopListening()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startListening() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      })
      setIsMicAllowed(true)
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      await ctx.resume()
      setSampleRate(ctx.sampleRate)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0 // we do our own smoothing
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      ctxRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = source
      streamRef.current = stream
      bufRef.current = new Float32Array(analyser.fftSize)

      setIsListening(true)
      tick()
    } catch (e: any) {
      console.error(e)
      setIsMicAllowed(false)
      setError(e?.message || "Failed to access microphone")
      stopListening()
    }
  }

  function stopListening() {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    try {
      sourceRef.current?.disconnect()
    } catch {}
    analyserRef.current?.disconnect()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    ctxRef.current?.close().catch(() => {})
    ctxRef.current = null
    analyserRef.current = null
    sourceRef.current = null
    streamRef.current = null
    bufRef.current = null
    setIsListening(false)
    setFrequency(null)
    setRms(0)
    smoothFreqRef.current = null
  }

  function tick() {
    const analyser = analyserRef.current
    const buf = bufRef.current
    const ctx = ctxRef.current
    if (!analyser || !buf || !ctx) return

    analyser.getFloatTimeDomainData(buf)
    const { freq, rms } = detectPitch(buf, sampleRate)
    setRms(rms)

    if (freq && freq > 0) {
      // low-pass smoothing
      const alpha = Math.max(0, Math.min(0.95, smoothing))
      const prev = smoothFreqRef.current
      const smoothed = prev == null ? freq : prev * alpha + freq * (1 - alpha)
      smoothFreqRef.current = smoothed
      setFrequency(smoothed)
    } else {
      // decay smoothing toward null to avoid stale note
      const prev = smoothFreqRef.current
      if (prev != null) {
        const decayed = prev * 0.98
        if (decayed < 20) {
          smoothFreqRef.current = null
          setFrequency(null)
        } else {
          smoothFreqRef.current = decayed
          setFrequency(decayed)
        }
      } else {
        setFrequency(null)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  const activeTargetFreq = autoMode
    ? (() => {
        if (!frequency) return null
        const midi = frequencyToNote(frequency, a4).midi
        return midiToFrequency(midi, a4)
      })()
    : STANDARD_TUNING[selectedString]

  const noteInfo = React.useMemo(() => {
    if (!frequency) return null
    const { midi, name, octave } = frequencyToNote(frequency, a4)
    const nearestFreq = midiToFrequency(midi, a4)
    const cents = centsOffFromPitch(frequency, nearestFreq)
    return { midi, name, octave, cents, nearestFreq }
  }, [frequency, a4])

  const centsToTarget =
    frequency && activeTargetFreq ? centsOffFromPitch(frequency, activeTargetFreq) : null

  const inTune =
    typeof centsToTarget === "number" && Math.abs(centsToTarget) <= 5

  const loudEnough = rms > 0.01 // basic gate to detect signal presence

  return (
    <div className="grid gap-6">
      {/* Controls row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <Button
            variant={isListening ? "secondary" : "default"}
            onClick={isListening ? stopListening : startListening}
            className="justify-start"
            aria-pressed={isListening}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-4 w-4" aria-hidden="true" /> Stop Mic
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" aria-hidden="true" /> Start Mic
              </>
            )}
          </Button>

          <Select
            defaultValue={selectedString}
            onValueChange={(v) => setSelectedString(v as StringId)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose string" />
            </SelectTrigger>
            <SelectContent>
              {STRING_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {s} • {STANDARD_TUNING[s].toFixed(2)} Hz
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              id="auto-mode"
              checked={autoMode}
              onCheckedChange={setAutoMode}
              aria-describedby="auto-mode-hint"
            />
            <div className="grid">
              <Label htmlFor="auto-mode" className="leading-none">
                Auto note
              </Label>
              <span id="auto-mode-hint" className="text-xs text-zinc-500">
                Nearest note vs string target
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <Label htmlFor="a4" className="mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4 text-zinc-500" aria-hidden="true" />
              A4 Calibration: {a4} Hz
            </Label>
            <Slider
              id="a4"
              min={430}
              max={450}
              step={1}
              value={[a4]}
              onValueChange={(v) => setA4(v[0] ?? 440)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={inTune ? "default" : "secondary"} className={cn(inTune ? "bg-emerald-600" : "bg-zinc-200 text-zinc-700")}>
            {inTune ? "In tune" : "Adjust"}
          </Badge>
          <div className="flex items-center text-xs text-zinc-500" aria-live="polite">
            <Info className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {isListening
              ? loudEnough
                ? "Listening..."
                : "Increase volume or pluck a string"
              : isMicAllowed === false
                ? "Microphone blocked. Allow access and try again."
                : "Click Start Mic to begin"}
          </div>
        </div>
      </div>

      {/* Display */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500">Detected</div>
            <div className="text-sm text-zinc-500">RMS: {rms.toFixed(3)}</div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <div
                className={cn(
                  "tabular-nums font-semibold tracking-tight",
                  frequency ? "text-3xl sm:text-4xl" : "text-xl text-zinc-400"
                )}
                aria-live="polite"
                aria-atomic="true"
              >
                {frequency ? `${frequency.toFixed(2)} Hz` : "—"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500">Nearest note</div>
              <div className="mt-1">
                {noteInfo ? (
                  <span className="text-4xl font-bold leading-none">
                    {noteInfo.name}
                    <span className="ml-1 align-top text-base text-zinc-500"> {noteInfo.octave}</span>
                  </span>
                ) : (
                  <span className="text-xl text-zinc-400">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <TuningMeter
              cents={centsToTarget ?? 0}
              active={Boolean(frequency && loudEnough)}
              targetHz={activeTargetFreq ?? undefined}
              currentHz={frequency ?? undefined}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-zinc-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Target</span>
                <span className="font-medium">
                  {activeTargetFreq ? `${activeTargetFreq.toFixed(2)} Hz` : "—"}
                </span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {autoMode
                  ? "Nearest note target"
                  : `Selected string: ${selectedString}`}
              </div>
            </div>
            <div className="rounded-md bg-zinc-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Deviation</span>
                <span className={cn(
                  "font-medium tabular-nums",
                  typeof centsToTarget === "number"
                    ? Math.abs(centsToTarget) <= 5
                      ? "text-emerald-600"
                      : Math.abs(centsToTarget) <= 15
                        ? "text-amber-600"
                        : "text-rose-600"
                    : "text-zinc-400"
                )}>
                  {typeof centsToTarget === "number" ? `${centsToTarget > 0 ? "+" : ""}${centsToTarget.toFixed(1)}¢` : "—"}
                </span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Negative = flat, positive = sharp
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TuningFork className="h-4 w-4 text-zinc-600" aria-hidden="true" />
              <div className="text-sm text-zinc-600">Reference Tone</div>
            </div>
            <Badge variant="secondary" className="text-zinc-700">
              Standard EADGBE
            </Badge>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label className="text-sm text-zinc-600">String</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {STRING_ORDER.map((s) => (
                  <Button
                    key={s}
                    variant={selectedString === s ? "default" : "outline"}
                    onClick={() => setSelectedString(s)}
                    className="justify-center"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
            <ReferenceTone
              frequency={STANDARD_TUNING[selectedString]}
              a4={a4}
              defaultVolume={0.15}
              defaultWaveform="sine"
            />
            <div className="rounded-md bg-zinc-50 p-3 text-xs text-zinc-600">
              Use the tone to tune by ear, or enable the mic and match the meter.
            </div>
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div className="rounded-lg border border-zinc-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-600">Advanced</div>
          <div className="text-xs text-zinc-500">Smoothing</div>
        </div>
        <div className="mt-3 grid gap-2">
          <Slider
            min={0}
            max={0.95}
            step={0.05}
            value={[smoothing]}
            onValueChange={(v) => setSmoothing(v[0] ?? 0.6)}
          />
          <div className="text-xs text-zinc-500">Lower = responsive, Higher = stable</div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
          {error}
        </div>
      )}
    </div>
  )
}
