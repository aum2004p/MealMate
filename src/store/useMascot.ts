import { create } from 'zustand'
import type { Mood } from '../components/Mascot'

interface Msg {
  id: number
  text: string
  mood: Mood
  burst: boolean
  at: number
}

interface MascotState {
  msg: Msg | null
  say: (text: string, mood?: Mood, burst?: boolean) => void
  clear: () => void
}

let counter = 0

export const useMascot = create<MascotState>()((set) => ({
  msg: null,
  say: (text, mood = 'hi', burst = false) => set({ msg: { id: ++counter, text, mood, burst, at: Date.now() } }),
  clear: () => set({ msg: null }),
}))
