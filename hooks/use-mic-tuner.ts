'use client'

import { useCallback, useEffect, useRef, useState } from "react"

// Autocorrelation that reuses arrays to reduce allocations and memory churn
function autoCorrelate(buf: Float32Array, sampleRate: number, acBuf: Float32Array): number {
  let SIZE = buf.length
  // RMS gate
  let sum = 0
  for (let i = 0; i < SIZE; i++) {
    const v = buf[i]
    sum += v * v
  }
  const rms = Math.sqrt(sum / SIZE)
  if (rms < 0.01) return -1

  // Center clip threshold to remove noise
  const thres = 0.2
  let r1 = 0, r2 = SIZE - 1
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) { r1 = i; break }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break }
  }

  let clipped = buf
  if (r1 > 0 || r2 < SIZE - 1) {
    clipped = buf.slice(r1, r2)
    SIZE = clipped.length
  }

  // Autocorrelation (naive but reusing acBuf)
  acBuf.fill(0, 0, SIZE)
  for (let i = 0; i < SIZE; i++) {
    let sum2 = 0
    for (let j = 0; j < SIZE - i; j++) {
      sum2 += clipped[j] * clipped[j + i]
    }
    acBuf[i] = sum2
  }

  // Peak picking
  let d = 0
  while (acBuf[d] > acBuf[d + 1]) d++
  let maxval = -1, maxpos = -1
  for (let i = d; i < SIZE; i++) {
    const v = acBuf[i]
    if (v > maxval) { maxval = v; maxpos = i }
  }
  let T0 = maxpos
  if (T0 <= 0) return -1

  // Parabolic interpolation
  const x1 = acBuf[T0 - 1], x2 = acBuf[T0], x3 = acBuf[T0 + 1]
  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2
  if (a) T0 = T0 - b / (2 * a)

  return sampleRate / T0
}

type Options = {
  deviceId?: string
}

export function useMicTuner(opts: Options = {}) {
  const [frequency, setFrequency] = useState<number | null>(null)
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)

  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const bufferRef = useRef<Float32Array | null>(null)
  const acBufRef = useRef<Float32Array | null>(null)

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    analyserRef.current?.disconnect()
    ctxRef.current?.close()
    ctxRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    bufferRef.current = null
    acBufRef.current = null
    setIsReady(false)
  }, [])

  const start = useCallback(async () => {
    try {
      setError(null)
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          deviceId: opts.deviceId ? { exact: opts.deviceId } : undefined,
        },
        video: false,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setHasPermission(true)
      streamRef.current = stream

      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      const ctx = new Ctx()
      ctxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser

      source.connect(analyser)

      bufferRef.current = new Float32Array(analyser.fftSize)
      acBufRef.current = new Float32Array(analyser.fftSize)
      setIsReady(true)

      const update = () => {
        const analyserNode = analyserRef.current
        const buf = bufferRef.current
        const ac = acBufRef.current
        const audioCtx = ctxRef.current
        if (!analyserNode || !buf || !ac || !audioCtx) return

        analyserNode.getFloatTimeDomainData(buf)
        const freq = autoCorrelate(buf, audioCtx.sampleRate, ac)
        setFrequency(freq > 0 && isFinite(freq) && freq < 2000 ? freq : null)

        rafRef.current = requestAnimationFrame(update)
      }
      update()

      // Populate devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      setDeviceList(devices.filter((d) => d.kind === "audioinput"))
      return true
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Could not access microphone.")
      setHasPermission(false)
      return false
    }
  }, [opts.deviceId])

  const stop = useCallback(() => {
    cleanup()
  }, [cleanup])

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return {
    start,
    stop,
    frequency,
    deviceList,
    error,
    hasPermission,
    isReady,
  }
}
