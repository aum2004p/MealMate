import { useState } from 'react'
import { useStore } from '../store/useStore'
import RecipeCard from '../components/RecipeCard'
import Stars from '../components/Stars'
import { Empty } from '../components/States'
import { Link } from 'react-router-dom'

export default function Collection() {
  const favs = useStore((s) => s.favs)
  const notes = useStore((s) => s.notes)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [sort, setSort] = useState<'name' | 'rate'>('name')
  const all = Object.values(favs)
  const cats = [...new Set(all.map((r) => r.category).filter(Boolean))]
  const list = all
    .filter((r) => r.name.toLowerCase().includes(q.toLowerCase()))
    .filter((r) => !cat || r.category === cat)
    .sort((a, b) =>
      sort === 'rate'
        ? (notes[b.id]?.rating ?? 0) - (notes[a.id]?.rating ?? 0)
        : a.name.localeCompare(b.name),
    )
  return (
    <>
      <h1>คอลเลกชันของฉัน</h1>
      <p>สูตรที่บันทึกไว้ ให้คะแนนและจดโน้ตได้ที่หน้าสูตร</p>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 ค้นหาในคอลเลกชัน" aria-label="ค้นหาในคอลเลกชัน" />
      <div className="chips" role="group" aria-label="หมวดหมู่">
        {['', ...cats].map((c) => (
          <button key={c || 'all'} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c || 'ทั้งหมด'}</button>
        ))}
      </div>
      <div className="bar">
        <label>เรียงตาม{' '}
          <select value={sort} onChange={(e) => setSort(e.target.value as 'name' | 'rate')} style={{ width: 'auto' }}>
            <option value="name">ชื่อเมนู</option>
            <option value="rate">คะแนนสูงสุด</option>
          </select>
        </label>
      </div>
      <div className="grid">
        {list.length === 0 && (
          <Empty title={all.length ? 'ไม่พบสูตรที่ค้นหา' : 'ยังไม่มีสูตรที่บันทึกไว้'}>
            <p>กดปุ่ม “บันทึก” ที่สูตรที่ชอบ แล้วสูตรจะมาอยู่ที่นี่</p>
            <Link className="btn" to="/recipes">🔍 ดูสูตรทั้งหมด</Link>
          </Empty>
        )}
        {list.map((r) => (
          <RecipeCard key={r.id} r={r} extra={
            <>
              <Stars id={r.id} />
              {notes[r.id]?.text && <small>📝 {notes[r.id].text}</small>}
            </>
          } />
        ))}
      </div>
    </>
  )
}
