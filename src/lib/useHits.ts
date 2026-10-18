import { useStore } from '../store/useStore'
import { avoidHits } from './utils'
import type { Recipe } from '../types'

export function useHits(r: Recipe | null | undefined): string[] {
  const avoid = useStore((s) => s.avoid)
  return r ? avoidHits(r, avoid.groups, avoid.custom) : []
}
