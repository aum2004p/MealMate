import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSearchMeals } from '../api/meals'
import { LOCAL } from '../data/localRecipes'
import { useStore } from '../store/useStore'
import { MEALS, longDate } from '../lib/utils'
import type { Recipe } from '../types'
import Mascot from '../components/Mascot'
import Pic from '../components/Pic'
import { RecipeMeta } from '../components/RecipeCard'

function MealSlot({ date, mi, options }: { date: string; mi: number; options: Recipe[] }) {
  const m = MEALS[mi]
  const key = `${date}|${mi}`
  const r = useStore((s) => s.plan[key])
  const setPlan = useStore((s) => s.setPlan)
  const clearPlan = useStore((s) => s.clearPlan)
  const [sel, setSel] = useState('')
  const list = r && !options.some((o) => o.id === r.id) ? [r, ...options] : options
  const value = sel || r?.id || ''

  function apply() {
    const pick = list.find((o) => o.id === value)
    if (pick) setPlan(key, pick)
    setSel('')
  }

  const select = (
    <select value={value} onChange={(e) => setSel(e.target.value)} style={{ width: 'auto', maxWidth: 260 }} aria-label={`เลือกเมนู (${m.label})`}>
      {!r && <option value="">เลือกเมนู...</option>}
      {list.map((o) => <option key={o.id} value={o.id}>{o.emoji ?? ''} {o.name}</option>)}
    </select>
  )

  return (
    <section className="paper">
      <h2>{m.icon} {m.label}</h2>
      {r ? (
        <>
          <div className="mealrow">
            <Pic r={r} size={90} />
            <div>
              <h3>{r.name}</h3>
              {r.source === 'local' ? (
                <p className="meta"><span>⏱ {(r.prep ?? 0) + (r.cook ?? 0)} นาที</span><span>🍽 {r.servings} ที่</span></p>
              ) : (
                <RecipeMeta r={r} />
              )}
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" to={`/recipe/${r.id}`}>📖 ดูสูตร</Link>
            {select}
            <button className="btn sage" disabled={value === r.id} onClick={apply}>🔄 เปลี่ยนเมนู</button>
            <button className="btn alt" onClick={() => clearPlan(key)}>🗑 เอาออก</button>
          </div>
        </>
      ) : (
        <>
          <div className="mealrow">
            <div><Mascot mood="think" size={70} /></div>
            <p style={{ margin: 0 }}>ยังไม่มีเมนูสำหรับ{m.label} เลือกเมนูจากสูตรที่มีแล้วกดเพิ่มได้เลย</p>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            {select}
            <button className="btn" disabled={!value} onClick={apply}>➕ เพิ่มเมนู</button>
          </div>
        </>
      )}
    </section>
  )
}

function Finder({ onPick }: { onPick: (r: Recipe) => void }) {
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setQ(input.trim()), 350)
    return () => clearTimeout(t)
  }, [input])
  const res = useSearchMeals(q, q.length >= 2)
  return (
    <>
      <input type="search" value={input} onChange={(e) => setInput(e.target.value)} placeholder="ค้นหาเมนูจาก TheMealDB (ภาษาอังกฤษ) เช่น pasta" aria-label="ค้นหาเมนูอื่น" />
      {res.isLoading && <p>กำลังค้นหา...</p>}
      {res.isError && <p role="alert">ค้นหาไม่สำเร็จ ลองใหม่อีกครั้ง</p>}
      {res.data && res.data.length === 0 && <p>ไม่พบเมนูที่ค้นหา</p>}
      <div className="row" style={{ marginTop: 10 }}>
        {res.data?.slice(0, 6).map((r) => (
          <button key={r.id} className="btn alt" onClick={() => onPick(r)}>➕ {r.name}</button>
        ))}
      </div>
    </>
  )
}

export default function DayDetail() {
  const { date = '' } = useParams()
  const favs = useStore((s) => s.favs)
  const [extra, setExtra] = useState<Recipe[]>([])
  const d = new Date(`${date}T12:00:00`)
  if (Number.isNaN(d.getTime())) {
    return <div className="empty">ไม่พบวันที่นี้ <Link className="btn" to="/plan">กลับไปปฏิทิน</Link></div>
  }

  const map = new Map<string, Recipe>()
  ;[...extra, ...Object.values(favs), ...LOCAL].forEach((r) => map.set(r.id, r))
  const options = [...LOCAL, ...[...map.values()].filter((r) => r.source === 'api')]

  return (
    <>
      <p><Link className="btn alt" to="/plan">← กลับไปปฏิทิน</Link></p>
      <h1>{longDate(d)}</h1>
      {MEALS.map((_, mi) => <MealSlot key={mi} date={date} mi={mi} options={options} />)}
      <details className="paper">
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>🔍 หาเมนูอื่นจาก TheMealDB มาเพิ่มในรายการเลือก</summary>
        <Finder onPick={(r) => setExtra((e) => [r, ...e])} />
        <p style={{ marginBottom: 0 }}><small>กดเพิ่มแล้ว เมนูจะขึ้นในรายการเลือกของแต่ละมื้อด้านบน</small></p>
      </details>
    </>
  )
}
