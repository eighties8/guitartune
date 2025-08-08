export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

export function frequencyToMidi(f: number, a4 = 440) {
  return 69 + 12 * Math.log2(f / a4)
}

export function midiToFrequency(m: number, a4 = 440) {
  return a4 * Math.pow(2, (m - 69) / 12)
}

export function getNoteNameFromFrequency(f: number, a4 = 440) {
  if (!f || !isFinite(f)) return { noteName: "—", octave: 0 }
  const midi = Math.round(frequencyToMidi(f, a4))
  const name = NOTE_NAMES[(midi + 1200) % 12]
  const octave = Math.floor(midi / 12) - 1
  return { noteName: name, octave }
}

export function centsOffFromPitch(f: number, a4 = 440) {
  if (!f || !isFinite(f)) return 0
  const midi = frequencyToMidi(f, a4)
  const nearest = Math.round(midi)
  return (midi - nearest) * 100
}

export function normalizeCents(cents: number) {
  if (!isFinite(cents)) return 0
  return Math.max(-50, Math.min(50, cents))
}

export function roundFrequency(f?: number | null) {
  if (!f || !isFinite(f)) return "—"
  if (f >= 100) return f.toFixed(1)
  return f.toFixed(2)
}
