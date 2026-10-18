import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Recipe } from '../types'
import { useMascot } from './useMascot'

export interface Note {
  rating: number
  text: string
}

interface State {
  favs: Record<string, Recipe>
  plan: Record<string, Recipe>
  notes: Record<string, Note>
  done: string[]
  goal: number
  checked: Record<string, boolean>
  avoid: { groups: string[]; custom: string }
  toggleFav: (r: Recipe) => void
  setPlan: (key: string, r: Recipe) => void
  clearPlan: (key: string) => void
  setNote: (id: string, n: Partial<Note>) => void
  toggleDone: (id: string) => void
  setGoal: (n: number) => void
  toggleChecked: (key: string) => void
  toggleGroup: (g: string) => void
  setCustom: (s: string) => void
}

const say = (text: string, mood?: 'hi' | 'cheer' | 'think' | 'cook', burst?: boolean) =>
  useMascot.getState().say(text, mood, burst)

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      favs: {},
      plan: {},
      notes: {},
      done: [],
      goal: 2000,
      checked: {},
      avoid: { groups: [], custom: '' },
      toggleFav: (r) => {
        const had = !!get().favs[r.id]
        set((s) => {
          const favs = { ...s.favs }
          if (had) delete favs[r.id]
          else favs[r.id] = r
          return { favs }
        })
        if (had) say('เอาออกจากรายการโปรดแล้วนะ', 'think')
        else say('บันทึกเมนูโปรดแล้ว! 💗', 'cheer')
      },
      setPlan: (key, r) => {
        set((s) => ({ plan: { ...s.plan, [key]: r } }))
        say('จัดลงแผนแล้ว เยี่ยมเลย!', 'cook')
      },
      clearPlan: (key) => {
        set((s) => {
          const plan = { ...s.plan }
          delete plan[key]
          return { plan }
        })
        say('เอาเมนูออกจากแผนแล้ว', 'think')
      },
      setNote: (id, n) =>
        set((s) => ({
          notes: { ...s.notes, [id]: { ...(s.notes[id] ?? { rating: 0, text: '' }), ...n } },
        })),
      toggleDone: (id) => {
        const adding = !get().done.includes(id)
        set((s) => ({
          done: s.done.includes(id) ? s.done.filter((x) => x !== id) : [...s.done, id],
        }))
        if (adding) say('ทำเสร็จแล้ว! เก่งมากเลย 🎉', 'cheer', true)
      },
      setGoal: (goal) => set({ goal }),
      toggleChecked: (key) => set((s) => ({ checked: { ...s.checked, [key]: !s.checked[key] } })),
      toggleGroup: (g) =>
        set((s) => ({
          avoid: {
            ...s.avoid,
            groups: s.avoid.groups.includes(g)
              ? s.avoid.groups.filter((x) => x !== g)
              : [...s.avoid.groups, g],
          },
        })),
      setCustom: (custom) => set((s) => ({ avoid: { ...s.avoid, custom } })),
    }),
    { name: 'mealmate-v1' },
  ),
)
