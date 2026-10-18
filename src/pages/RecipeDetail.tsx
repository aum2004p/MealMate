import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMeal } from '../api/meals'
import { useStore } from '../store/useStore'
import { useHits } from '../lib/useHits'
import { num, scaleMeasure } from '../lib/utils'
import { useTranslateList } from '../lib/useTranslate'
import Pic from '../components/Pic'
import Stars from '../components/Stars'
import { ErrorBox, Loading, Empty } from '../components/States'

const FACTORS = [0.5, 1, 2, 3]

export default function RecipeDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const q = useMeal(id)
  const r = q.data
  const hits = useHits(r)
  const [factor, setFactor] = useState(1)
  const [svo, setSvo] = useState<number | null>(null)
  const fav = useStore((s) => !!s.favs[id])
  const done = useStore((s) => s.done.includes(id))
  const note = useStore((s) => s.notes[id]?.text ?? '')
  const toggleFav = useStore((s) => s.toggleFav)
  const toggleDone = useStore((s) => s.toggleDone)
  const setNote = useStore((s) => s.setNote)

  const isApi = q.data?.source === 'api'
  const [doTranslate, setDoTranslate] = useState(false)

  const stepsToTranslate = isApi ? (q.data?.steps ?? []) : []
  const ingNamesToTranslate = isApi ? (q.data?.ingredients.map((i) => i.name) ?? []) : []
  const ingMeasuresToTranslate = isApi ? (q.data?.ingredients.map((i) => i.measure) ?? []) : []

  const { translated: translatedSteps, loading: stepsLoading } = useTranslateList(stepsToTranslate, isApi && doTranslate)
  const { translated: translatedIngNames } = useTranslateList(ingNamesToTranslate, isApi && doTranslate)
  const { translated: translatedIngMeasures } = useTranslateList(ingMeasuresToTranslate, isApi && doTranslate)

  if (q.isLoading) return <Loading text="กำลังโหลดสูตร..." />
  if (q.isError) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  if (!r) return <Empty title="ไม่พบสูตรนี้"><Link className="btn" to="/recipes">กลับไปสูตรอาหาร</Link></Empty>

  const local = r.source === 'local'
  const base = r.servings ?? 1
  const sv = svo ?? base

  const displaySteps = local ? r.steps : translatedSteps
  const displayIngredients = local
    ? r.ingredients
    : r.ingredients.map((ing, i) => ({
        ...ing,
        name: translatedIngNames[i] ?? ing.name,
        measure: translatedIngMeasures[i] ?? ing.measure,
      }))

  return (
    <>
      <p><button className="btn alt" onClick={() => navigate(-1)}>← ย้อนกลับ</button></p>
      {hits.length > 0 && (
        <div className="paper" style={{ background: 'var(--butter)', color: '#4a3226' }}>
          <b>⚠ สูตรนี้มีวัตถุดิบที่คุณตั้งไว้ว่าหลีกเลี่ยง:</b> {hits.join(', ')}
        </div>
      )}
      <div className="two">
        <Pic r={r} big />
        <div>
          <h1>{r.name}</h1>
          {r.desc && <p>{r.desc}</p>}
          <p className="meta">
            {local ? (
              <>
                <span className="chip">เตรียม {r.prep} นาที</span>
                <span className="chip">ทำ {r.cook} นาที</span>
                <span className="chip">{r.difficulty}</span>
              </>
            ) : (
              <>
                <span className="chip">{r.category}</span>
                <span className="chip">{r.area}</span>
              </>
            )}
          </p>
          {local ? (
            <p>
              จำนวนเสิร์ฟ:{' '}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <button className="chip" aria-label="ลดจำนวนเสิร์ฟ" onClick={() => setSvo(Math.max(1, sv - 1))}>−</button>
                <b>{sv} ที่</b>
                <button className="chip" aria-label="เพิ่มจำนวนเสิร์ฟ" onClick={() => setSvo(Math.min(12, sv + 1))}>+</button>
              </span>
            </p>
          ) : (
            <p>
              ปรับปริมาณ:{' '}
              {FACTORS.map((f) => (
                <button key={f} className="chip" aria-pressed={factor === f} onClick={() => setFactor(f)}>×{f}</button>
              ))}
            </p>
          )}
          <div className="row">
            <button className="btn" aria-pressed={fav} onClick={() => toggleFav(r)}>
              {fav ? '💗 บันทึกแล้ว' : '🤍 บันทึกเป็นรายการโปรด'}
            </button>
            <Link className="btn sage" to={`/cook/${r.id}`}>🍳 โหมดทำอาหาร</Link>
            <button className="btn alt" aria-pressed={done} onClick={() => toggleDone(r.id)}>
              {done ? '✅ ทำแล้ว (กดเพื่อยกเลิก)' : '⬜ ทำเมนูนี้แล้ว'}
            </button>
            {r.youtube && (
              <a className="btn alt" href={r.youtube} target="_blank" rel="noreferrer">▶ วิดีโอสอนทำ</a>
            )}
            {isApi && (
              <button
                className="btn"
                style={{ background: doTranslate ? '#3178c6' : undefined, color: doTranslate ? '#fff' : undefined }}
                onClick={() => setDoTranslate((v) => !v)}
                disabled={stepsLoading}
              >
                {stepsLoading ? '⏳ กำลังแปล...' : doTranslate ? '🌐 ดูภาษาอังกฤษ' : '🇹🇭 แปลเป็นไทย'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="two" style={{ marginTop: 28 }}>
        <section className="paper">
          <h2>🧺 วัตถุดิบ</h2>
          <ul className="ing">
            {displayIngredients.map((i) => (
              <li key={i.name}>
                <span>{i.name}</span>
                <b>{i.qty !== undefined ? `${num((i.qty * sv) / base)} ${i.unit}` : scaleMeasure(i.measure, factor)}</b>
              </li>
            ))}
          </ul>
          {!local && factor !== 1 && <small>ปรับเฉพาะปริมาณที่เป็นตัวเลข</small>}
        </section>
        <section className="paper">
          <h2>👩‍🍳 ขั้นตอนการทำ</h2>
          {displaySteps.map((s, i) => (
            <div className="step" key={i}><b>{i + 1}</b><span>{s}</span></div>
          ))}
        </section>
      </div>

      {r.kcal !== undefined && (
        <section className="paper" style={{ background: 'var(--sage)', color: '#2f3a25' }}>
          <h2>🥄 โภชนาการต่อที่เสิร์ฟ</h2>
          <p style={{ margin: 0 }}>พลังงาน {r.kcal} กิโลแคลอรี · โปรตีน {r.protein} กรัม (ค่าประมาณ)</p>
        </section>
      )}

      <section className="paper">
        <h2>📝 โน้ตและคะแนนของฉัน</h2>
        <Stars id={r.id} />
        <textarea rows={3} value={note} onChange={(e) => setNote(r.id, { text: e.target.value })} placeholder="จดเคล็ดลับ เช่น ลดพริกลงครึ่งหนึ่ง" aria-label="โน้ต" />
      </section>
    </>
  )
}
