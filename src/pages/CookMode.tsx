import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMeal } from '../api/meals'
import { useStore } from '../store/useStore'
import Mascot from '../components/Mascot'
import { useMascot } from '../store/useMascot'
import { Empty, ErrorBox, Loading } from '../components/States'

function Timer({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    if (left === null || left <= 0) return
    const t = setTimeout(() => setLeft((l) => (l === null ? null : l - 1)), 1000)
    return () => clearTimeout(t)
  }, [left])
  useEffect(() => {
    if (left === 0) {
      navigator.vibrate?.([300, 150, 300])
      useMascot.getState().say('หมดเวลาแล้ว! ลองเช็กอาหารดูนะ 🔔', 'cheer')
    }
  }, [left])
  const mm = left === null ? 0 : Math.floor(left / 60)
  const ss = left === null ? 0 : left % 60
  return (
    <>
      <p><button className="btn sage" onClick={() => setLeft(minutes * 60)}>⏲ จับเวลา {minutes} นาที</button></p>
      {left !== null && (
        <p style={{ fontSize: 34, fontFamily: 'Mali', margin: 0 }} aria-live="polite">
          {left === 0 ? 'หมดเวลาแล้ว! 🔔' : `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`}
        </p>
      )}
    </>
  )
}

export default function CookMode() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const q = useMeal(id)
  const done = useStore((s) => s.done)
  const toggleDone = useStore((s) => s.toggleDone)
  const [i, setI] = useState(0)

  if (q.isLoading) return <Loading text="กำลังโหลดสูตร..." />
  if (q.isError) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  const r = q.data
  if (!r) return <Empty title="ไม่พบสูตรนี้"><Link className="btn" to="/recipes">กลับไปสูตรอาหาร</Link></Empty>

  const step = r.steps[Math.min(i, r.steps.length - 1)] ?? ''
  const found = /(\d+)(?:\s*(?:-|to)\s*\d+)?\s*(?:minutes?|mins?)\b/i.exec(step)
  const preset = r.timers?.[i]
  const minutes = preset !== undefined ? preset : found ? Number(found[1]) : 0
  const last = i >= r.steps.length - 1

  function finish() {
    if (!done.includes(r!.id)) toggleDone(r!.id)
    navigate(`/recipe/${r!.id}`)
  }

  return (
    <>
      <p><Link className="btn alt" to={`/recipe/${r.id}`}>← กลับไปหน้าสูตร</Link></p>
      <section className="paper" style={{ textAlign: 'center' }}>
        <p><span className="chip">{r.name} · ขั้นที่ {i + 1} จาก {r.steps.length}</span></p>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Mascot mood="cook" size={110} /></div>
        <p style={{ font: '700 clamp(20px,3.5vw,28px)/1.6 Mali, cursive', margin: '12px 0' }}>{step}</p>
        {minutes > 0 && <Timer key={i} minutes={minutes} />}
        <div className="row" style={{ justifyContent: 'center', marginTop: 18 }}>
          <button className="btn alt" disabled={i === 0} onClick={() => setI(i - 1)}>← ย้อนกลับ</button>
          {last ? (
            <button className="btn" onClick={finish}>🎉 ทำเสร็จแล้ว!</button>
          ) : (
            <button className="btn" onClick={() => setI(i + 1)}>ถัดไป →</button>
          )}
        </div>
      </section>
      <section className="paper">
        <h3>🧺 วัตถุดิบ</h3>
        <ul className="ing">
          {r.ingredients.map((x) => <li key={x.name}><span>{x.name}</span><b>{x.measure}</b></li>)}
        </ul>
      </section>
    </>
  )
}
