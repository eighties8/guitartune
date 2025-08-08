import { midiToFrequency } from "./tuner-math"

export type TuningPreset = "standard" | "drop-d" | "half-step-down"

export type PresetString = { id: string; label: string; midi: number; hz: number }
export type PresetDefinition = { key: TuningPreset; label: string; strings: PresetString[] }

function stringsFromMidi(labels: string[], midis: number[]): PresetString[] {
  return labels.map((label, i) => {
    const midi = midis[i]
    return { id: label, label, midi, hz: midiToFrequency(midi) }
  })
}

export const presets: Record<TuningPreset, PresetDefinition> = {
  standard: {
    key: "standard",
    label: "Standard (E A D G B E)",
    strings: stringsFromMidi(["E2","A2","D3","G3","B3","E4"], [40,45,50,55,59,64]),
  },
  "drop-d": {
    key: "drop-d",
    label: "Drop D (D A D G B E)",
    strings: stringsFromMidi(["D2","A2","D3","G3","B3","E4"], [38,45,50,55,59,64]),
  },
  "half-step-down": {
    key: "half-step-down",
    label: "Half-step Down (Eb Ab Db Gb Bb Eb)",
    strings: stringsFromMidi(["Eb2","Ab2","Db3","Gb3","Bb3","Eb4"], [39,44,49,54,58,63]),
  },
}

export function getPreset(key: TuningPreset): PresetDefinition {
  return presets[key]
}

// Shift all strings by a number of semitones (can be fractional)
export function semitoneShiftAll(preset: PresetDefinition, semitones: number): PresetDefinition {
  return {
    ...preset,
    strings: preset.strings.map(s => {
      const midi = s.midi + semitones
      return { ...s, midi, hz: midiToFrequency(midi) }
    })
  }
}
