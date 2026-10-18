import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Recipe } from '../types'
import { useStore } from '../store/useStore'
import { fetchMeal } from '../api/meals'
import { useHits } from '../lib/useHits'
import Pic from './Pic'

export function RecipeMeta({ r }: { r: Recipe }) {
  if (r.source === 'local') {
    return (
      <p className="meta">
        <span>⏱ {(r.prep ?? 0) + (r.cook ?? 0)} นาที</span>
        <span className="chip">{r.difficulty}</span>
      </p>
    )
  }
  return (
    <p className="meta">
      {r.category && <span className="chip">{r.category}</span>}
      {r.area && <span className="chip">{r.area}</span>}
    </p>
  )
}

export default function RecipeCard({ r, extra }: { r: Recipe; extra?: ReactNode }) {
  const fav = useStore((s) => !!s.favs[r.id])
  const done = useStore((s) => s.done.includes(r.id))
  const toggleFav = useStore((s) => s.toggleFav)
  const hits = useHits(r)
  const [pending, setPending] = useState(false)

  // สถานะที่แสดงผล: ถ้า pending ให้แสดงตรงข้ามกับสถานะปัจจุบัน (optimistic)
  const displayFav = pending ? !fav : fav

  async function onFav() {
    if (pending) return
    if (r.detailed) {
      toggleFav(r)
      return
    }
    // API recipe ที่ยังไม่มีรายละเอียด → แสดง optimistic ทันที แล้วค่อย fetch
    setPending(true)
    try {
      const full = await fetchMeal(r.id)
      if (full) toggleFav(full)
    } catch {
      alert('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง')
    } finally {
      setPending(false)
    }
  }

  return (
    <article className="card">
      <Pic r={r} />
      <h3>
        {r.name}
        {done && <> <span className="chip done">✅ ทำแล้ว</span></>}
      </h3>
      <RecipeMeta r={r} />
      {hits.length > 0 && (
        <p className="meta"><span className="chip warn">⚠ มี {hits.join(', ')}</span></p>
      )}
      {extra}
      <div className="row">
        <Link className="btn" to={`/recipe/${r.id}`}>📖 ดูสูตร</Link>
        <button
          className={displayFav ? 'btn fav-active' : 'btn alt'}
          aria-pressed={displayFav}
          onClick={onFav}
          disabled={pending}
        >
          {displayFav ? '💗 บันทึก' : '🤍 บันทึก'}
        </button>
      </div>
    </article>
  )
}
