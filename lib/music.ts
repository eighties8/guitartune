export function frequencyToNote(freq: number, a4 = 440) {
  const midi = Math.round(12 * log2(freq / a4) + 69)
  const name = noteNameFromMidi(midi)
  const octave = Math.floor(midi / 12) - 1
  return { midi, name, octave }
}

export function midiToFrequency(midi: number, a4 = 440) {
  return a4 * Math.pow(2, (midi - 69) / 12)
}

export function centsOffFromPitch(freq: number, refFreq: number) {
  return 1200 * log2(freq / refFreq)
}

export function noteNameFromMidi(midi: number) {
  const NAMES = ["C", "C#","D","D#","E","F","F#","G","G#","A","A#","B"]
  return NAMES[(midi % 12 + 12) % 12]
}

function log2(x: number) {
  return Math.log(x) / Math.LN2
}
