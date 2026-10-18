import { useQuery } from '@tanstack/react-query'
import type { Recipe } from '../types'
import { LOCAL_BY_ID } from '../data/localRecipes'

const BASE = 'https://www.themealdb.com/api/json/v1/1'
export const FEATURED_TERM = 'a'

type Raw = Record<string, string | null>

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (รหัส ${res.status})`)
  return res.json() as Promise<T>
}

function toSteps(text: string): string[] {
  let lines = text
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !/^step\s*\d+$/i.test(s))
    .map((s) => s.replace(/^(step\s*\d+[.):-]?|\d+[.):-])\s*/i, ''))
    .filter(Boolean)
  if (lines.length < 3) {
    lines = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return lines
}

export function normalize(m: Raw): Recipe {
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const name = (m[`strIngredient${i}`] ?? '').trim()
    if (name) ingredients.push({ name, measure: (m[`strMeasure${i}`] ?? '').trim() })
  }
  return {
    id: m.idMeal ?? '',
    name: m.strMeal ?? '',
    category: m.strCategory ?? '',
    area: m.strArea ?? '',
    thumb: m.strMealThumb ?? '',
    youtube: m.strYoutube ?? '',
    steps: toSteps(m.strInstructions ?? ''),
    ingredients,
    detailed: true,
    source: 'api',
  }
}

export async function fetchMeal(id: string): Promise<Recipe | null> {
  const d = await get<{ meals: Raw[] | null }>(`/lookup.php?i=${encodeURIComponent(id)}`)
  return d.meals?.[0] ? normalize(d.meals[0]) : null
}

export async function fetchRandomMeal(): Promise<Recipe | null> {
  const d = await get<{ meals: Raw[] | null }>('/random.php')
  return d.meals?.[0] ? normalize(d.meals[0]) : null
}

export function useSearchMeals(term: string, enabled = true) {
  return useQuery({
    queryKey: ['search', term],
    enabled,
    queryFn: async () => {
      const d = await get<{ meals: Raw[] | null }>(`/search.php?s=${encodeURIComponent(term)}`)
      return (d.meals ?? []).map(normalize)
    },
  })
}

export function useByCategory(category: string) {
  return useQuery({
    queryKey: ['category', category],
    enabled: !!category,
    queryFn: async (): Promise<Recipe[]> => {
      const d = await get<{ meals: Raw[] | null }>(`/filter.php?c=${encodeURIComponent(category)}`)
      return (d.meals ?? []).map((m) => ({
        id: m.idMeal ?? '',
        name: m.strMeal ?? '',
        thumb: m.strMealThumb ?? '',
        category,
        area: '',
        youtube: '',
        steps: [],
        ingredients: [],
        detailed: false,
        source: 'api' as const,
      }))
    },
  })
}

export function useCategories(enabled = true) {
  return useQuery({
    queryKey: ['categories'],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      const d = await get<{ categories: { strCategory: string }[] }>('/categories.php')
      return d.categories.map((c) => c.strCategory)
    },
  })
}

export function useMeal(id: string) {
  return useQuery({
    queryKey: ['meal', id],
    enabled: !!id,
    queryFn: async () => LOCAL_BY_ID[id] ?? fetchMeal(id),
  })
}
