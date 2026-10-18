import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FEATURED_TERM, fetchRandomMeal, useByCategory, useCategories, useSearchMeals } from '../api/meals'
import { LOCAL, LOCAL_CATS } from '../data/localRecipes'
import { useStore } from '../store/useStore'
import { avoidHits } from '../lib/utils'
import RecipeCard from '../components/RecipeCard'
import AvoidBox from '../components/AvoidBox'
import MascotHero from '../components/MascotHero'
import { Empty, ErrorBox, Loading } from '../components/States'

type Src = 'th' | 'api'

export default function Browse({ home }: { home: boolean }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const avoid = useStore((s) => s.avoid)
  const [src, setSrc] = useState<Src>((state as { src?: Src } | null)?.src ?? 'th')
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [more, setMore] = useState(0)
  const isApi = src === 'api'

  useEffect(() => {
    const t = setTimeout(() => setQ(input.trim()), 350)
    return () => clearTimeout(t)
  }, [input])

  const cats = useCategories(isApi)
  const byCat = isApi && !q && !!cat
  const search = useSearchMeals(q || FEATURED_TERM, isApi && !byCat)
  const category = useByCategory(byCat ? cat : '')
  const active = byCat ? category : search

  let data = LOCAL
  if (!isApi) {
    const terms = q.split(/[,\s]+/).filter(Boolean)
    const score = (r: (typeof LOCAL)[number]) =>
      terms.filter((t) => r.name.includes(t) || r.ingredients.some((i) => i.name.includes(t))).length
    if (terms.length) data = LOCAL.filter((r) => score(r) > 0).sort((a, b) => score(b) - score(a))
    if (cat) data = data.filter((r) => r.category === cat)
  } else {
    data = (active.data ?? []).filter((r) => (q && cat ? r.category === cat : true))
  }
  const list = data.filter((r) => avoidHits(r, avoid.groups, avoid.custom).length === 0)
  const loading = isApi && active.isLoading
  const failed = isApi && active.isError
  const limit0 = home && !q && !cat ? 4 : 24
  const limit = limit0 + more
  const catList = isApi ? (cats.data ?? []) : LOCAL_CATS

  function changeSrc(s: Src) {
    setSrc(s)
    setCat('')
    setMore(0)
  }

  async function surprise() {
    if (!isApi) {
      const ok = LOCAL.filter((r) => avoidHits(r, avoid.groups, avoid.custom).length === 0)
      const pool = ok.length ? ok : LOCAL
      navigate(`/recipe/${pool[Math.floor(Math.random() * pool.length)].id}`)
      return
    }
    try {
      const r = await fetchRandomMeal()
      if (r) navigate(`/recipe/${r.id}`)
    } catch {
      alert('สุ่มเมนูไม่สำเร็จ ลองใหม่อีกครั้ง')
    }
  }

  return (
    <>
      <section className="hero">
        <div>
          <h1>{home ? 'วันนี้กินอะไรดี?' : 'สูตรอาหารทั้งหมด'}</h1>
          <p style={{ margin: 0 }}>ค้นหาสูตร บันทึกเมนูโปรด แล้วจัดลงแผนอาหารรายสัปดาห์</p>
          <div className="search">
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isApi ? '🔍 ค้นหาชื่อเมนู (ภาษาอังกฤษ) เช่น chicken, pasta' : '🔍 พิมพ์ชื่อเมนูหรือของที่มี เช่น ไก่ ไข่ แล้วระบบเรียงเมนูที่ตรงที่สุดให้'}
              aria-label="ค้นหาสูตรอาหาร"
            />
          </div>
          <p style={{ margin: '12px 0 0' }}>
            <button className="btn" onClick={surprise}>🎲 สุ่มเมนูให้หน่อย</button>
          </p>
        </div>
        <MascotHero />
      </section>

      <AvoidBox />

      <section style={{ marginTop: 26 }}>
        <h2>{home ? 'เมนูแนะนำ' : 'เลือกตามหมวด'}</h2>
        <div className="chips" role="group" aria-label="แหล่งสูตรอาหาร">
          <button className="chip" aria-pressed={!isApi} onClick={() => changeSrc('th')}>🍚 สูตรตัวอย่างไทย</button>
          <button className="chip" aria-pressed={isApi} onClick={() => changeSrc('api')}>🌍 อาหารนานาชาติ</button>
        </div>
        <div className="chips" role="group" aria-label="หมวดหมู่อาหาร">
          {['', ...catList].map((c) => (
            <button key={c || 'all'} className="chip" aria-pressed={cat === c} onClick={() => { setCat(c); setMore(0) }}>
              {c || 'ทั้งหมด'}
            </button>
          ))}
        </div>
        <div className="grid">
          {loading && <Loading />}
          {failed && <ErrorBox error={active.error} onRetry={() => active.refetch()} />}
          {!loading && !failed && list.length === 0 && (
            <Empty title="ไม่พบสูตรที่ค้นหา">
              <p>ลองเปลี่ยนคำค้นหา เลือกหมวดอื่น หรือปรับตัวกรองข้อจำกัดอาหาร</p>
            </Empty>
          )}
          {list.slice(0, limit).map((r) => <RecipeCard key={r.id} r={r} />)}
        </div>
        {list.length > limit && (
          <p style={{ textAlign: 'center', marginTop: 20 }}>
            {home ? (
              <Link className="btn sage" to="/recipes">📚 ดูสูตรทั้งหมด</Link>
            ) : (
              <button className="btn sage" onClick={() => setMore(more + 24)}>แสดงเพิ่ม</button>
            )}
          </p>
        )}
      </section>
    </>
  )
}
