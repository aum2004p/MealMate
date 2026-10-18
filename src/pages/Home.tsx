import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { LOCAL } from '../data/localRecipes'
import { dateKey, MEALS, weekDays } from '../lib/utils'
import { fetchRandomMeal, useSearchMeals } from '../api/meals'
import { avoidHits } from '../lib/utils'
import Pic from '../components/Pic'
import MascotHero from '../components/MascotHero'
import RecipeCard from '../components/RecipeCard'
import AvoidBox from '../components/AvoidBox'

const TIPS = [
  'เตรียมวัตถุดิบไว้ล่วงหน้า ช่วยให้ทำอาหารได้เร็วขึ้น 2 เท่า 🔪',
  'ข้าวที่หุงค้างคืนผัดข้าวได้อร่อยกว่าข้าวสด 🍚',
  'แช่เนื้อสัตว์ในน้ำเกลือก่อนปรุง ช่วยให้นุ่มและชุ่มฉ่ำขึ้น 🥩',
  'ใบกะเพราใส่ตอนปิดไฟ หอมกว่าใส่ตอนผัด 🌿',
  'บีบมะนาวตอนสุดท้ายก่อนเสิร์ฟ รสชาติสดกว่าเยอะ 🍋',
  'ต้มน้ำซุปด้วยไฟอ่อน ได้น้ำซุปใสและหอมกว่า 🫕',
  'ผักที่มีสีเขียวเข้มมักมีวิตามินสูงกว่าสีอ่อน 🥦',
  'ลองเพิ่มขมิ้นในแกงกะทิ ช่วยให้สีสวยและมีประโยชน์ต่อสุขภาพ 💛',
]

export default function Home() {
  const navigate = useNavigate()
  const avoid = useStore((s) => s.avoid)
  const favs = useStore((s) => s.favs)
  const plan = useStore((s) => s.plan)
  const notes = useStore((s) => s.notes)

  // สถิติ
  const favCount = Object.keys(favs).length
  const days = weekDays(0)
  const planCount = days.reduce((n, d) =>
    n + MEALS.filter((_, mi) => !!plan[`${dateKey(d)}|${mi}`]).length, 0)
  const ratedCount = Object.values(notes).filter((n) => n.rating > 0).length

  // เมนูแนะนำวันนี้
  const todayRecipe = useMemo(() => {
    const ok = LOCAL.filter((r) => avoidHits(r, avoid.groups, avoid.custom).length === 0)
    const pool = ok.length ? ok : LOCAL
    const seed = new Date().toDateString()
    let h = 0
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
    return pool[h % pool.length]
  }, [avoid])

  // อาหารนานาชาติจาก API
  const intlQuery = useSearchMeals('chicken', true)
  const intlRecipes = (intlQuery.data ?? []).slice(0, 4)

  // สูตรโปรดล่าสุด
  const recentFavs = Object.values(favs).slice(-4).reverse()

  // tip ประจำวัน
  const todayTip = useMemo(() => TIPS[new Date().getDate() % TIPS.length], [])

  async function surpriseApi() {
    try {
      const r = await fetchRandomMeal()
      if (r) navigate(`/recipe/${r.id}`)
    } catch { alert('สุ่มเมนูไม่สำเร็จ ลองใหม่') }
  }

  async function surpriseTh() {
    const ok = LOCAL.filter((r) => avoidHits(r, avoid.groups, avoid.custom).length === 0)
    const pool = ok.length ? ok : LOCAL
    navigate(`/recipe/${pool[Math.floor(Math.random() * pool.length)].id}`)
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div>
          <h1>วันนี้กินอะไรดี?</h1>
          <p style={{ margin: 0 }}>ค้นหาสูตร บันทึกเมนูโปรด แล้วจัดลงแผนอาหารรายสัปดาห์</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <button className="btn" onClick={surpriseTh}>🎲 สุ่มเมนูไทย</button>
            <button className="btn alt" onClick={surpriseApi}>🌍 สุ่มเมนูนานาชาติ</button>
            <Link className="btn sage" to="/recipes">📚 ดูสูตรทั้งหมด</Link>
          </div>
        </div>
        <MascotHero />
      </section>

      <AvoidBox />

      {/* ── สถิติ ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 24 }}>
        {[
          { icon: '💗', label: 'สูตรโปรด', value: favCount, to: '/collection' },
          { icon: '📅', label: 'มื้อสัปดาห์นี้', value: planCount, to: '/plan' },
          { icon: '⭐', label: 'สูตรที่ให้คะแนน', value: ratedCount, to: '/collection' },
        ].map((s) => (
          <Link key={s.label} to={s.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ alignItems: 'center', textAlign: 'center', padding: '18px 12px', gap: 4 }}>
              <span style={{ fontSize: 30 }}>{s.icon}</span>
              <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Mali,cursive' }}>{s.value}</span>
              <span style={{ fontSize: 13, opacity: 0.7 }}>{s.label}</span>
            </div>
          </Link>
        ))}
      </div>


      {/* ── 🍚 เมนูแนะนำอาหารไทย ── */}
      <section style={{ marginTop: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>เมนูแนะนำอาหารไทย</h2>
          <Link className="btn alt" to="/recipes">ดูทั้งหมด →</Link>
        </div>
        <div className="grid">
          {LOCAL.slice(0, 4).map((r) => <RecipeCard key={r.id} r={r} />)}
        </div>
      </section>

      {/* ── 🌍 เมนูแนะนำอาหารนานาชาติ ── */}
      <section style={{ marginTop: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>เมนูแนะนำอาหารนานาชาติ</h2>
          <Link className="btn alt" to="/recipes" state={{ src: 'api' }}>ดูทั้งหมด →</Link>
        </div>
        {intlQuery.isLoading ? (
          <div style={{ textAlign: 'center', padding: 32, opacity: 0.6 }}>⏳ กำลังโหลด...</div>
        ) : (
          <div className="grid">
            {intlRecipes.map((r) => <RecipeCard key={r.id} r={r} />)}
          </div>
        )}
      </section>

      {/* ── รายการโปรด ── */}
      {recentFavs.length > 0 && (
        <section style={{ marginTop: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>💗 รายการโปรดของคุณ</h2>
            <Link className="btn alt" to="/collection">ดูทั้งหมด →</Link>
          </div>
          <div className="grid">
            {recentFavs.map((r) => <RecipeCard key={r.id} r={r} />)}
          </div>
        </section>
      )}
    </>
  )
}
