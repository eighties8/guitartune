export function detectPitch(
  buffer: Float32Array,
  sampleRate: number
): { freq: number | null; rms: number } {
  // Compute RMS to check signal strength
  let rms = 0
  for (let i = 0; i < buffer.length; i++) {
    const v = buffer[i]
    rms += v * v
  }
  rms = Math.sqrt(rms / buffer.length)

  if (rms < 0.008) {
    return { freq: null, rms }
  }

  // Autocorrelation using difference function (AMDF-like correlation)
  const SIZE = buffer.length
  const MAX_LAG = Math.floor(SIZE / 2)
  let bestOffset = -1
  let bestCorrelation = 0
  const correlations = new Float32Array(MAX_LAG)

  for (let offset = 8; offset < MAX_LAG; offset++) {
    let diff = 0
    for (let i = 0; i < MAX_LAG; i++) {
      const a = buffer[i]
      const b = buffer[i + offset]
      const d = a - b
      diff += Math.abs(d)
    }
    const correlation = 1 - diff / MAX_LAG
    correlations[offset] = correlation

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation
      bestOffset = offset
    }
  }

  if (bestCorrelation < 0.01 || bestOffset === -1) {
    return { freq: null, rms }
  }

  // Parabolic interpolation around best offset for sub-sample accuracy
  const prev = correlations[bestOffset - 1] ?? 0
  const curr = correlations[bestOffset] ?? 0
  const next = correlations[bestOffset + 1] ?? 0
  const denom = 2 * (2 * curr - prev - next)
  let shift = 0
  if (denom !== 0) {
    shift = (next - prev) / denom
  }

  const period = bestOffset + shift
  const freq = period > 0 ? sampleRate / period : null

  return { freq: freq && isFinite(freq) ? freq : null, rms }
}
