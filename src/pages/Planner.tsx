import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MEALS, dateKey, num, weekDays } from '../lib/utils'
import Pic from '../components/Pic'
import { useMascot } from '../store/useMascot'
import Mascot from '../components/Mascot'

export default function Planner() {
  const plan = useStore((s) => s.plan)
  const checked = useStore((s) => s.checked)
  const toggleChecked = useStore((s) => s.toggleChecked)
  const goal = useStore((s) => s.goal)
  const setGoal = useStore((s) => s.setGoal)
  const [offset, setOffset] = useState(0)
  const [copyMsg, setCopyMsg] = useState('')
  const days = weekDays(offset)
  const [today] = useState(() => dateKey(new Date()))
  const weekId = dateKey(days[0])

  const agg = new Map<string, { name: string; qty?: number; unit?: string; measures: string[] }>()
  days.forEach((d) =>
    MEALS.forEach((_, mi) => {
      plan[`${dateKey(d)}|${mi}`]?.ingredients.forEach((i) => {
        const hasQty = i.qty !== undefined
        const k = hasQty ? `${i.name}|${i.unit}` : i.name.toLowerCase()
        const e = agg.get(k) ?? { name: i.name, qty: hasQty ? 0 : undefined, unit: i.unit, measures: [] }
        if (hasQty) e.qty = (e.qty ?? 0) + (i.qty ?? 0)
        else if (i.measure) e.measures.push(i.measure)
        agg.set(k, e)
      })
    }),
  )
  const kcal = days.map((d) =>
    MEALS.reduce((sum, _, mi) => sum + (plan[`${dateKey(d)}|${mi}`]?.kcal ?? 0), 0),
  )
  const items = [...agg.entries()]
  const label = (e: { name: string; qty?: number; unit?: string; measures: string[] }) =>
    e.qty !== undefined
      ? `${e.name} ${num(e.qty)} ${e.unit}`
      : `${e.name}${e.measures.length ? ` — ${e.measures.join(' + ')}` : ''}`

  async function copyList() {
    const lines: string[] = ['🛒 MealMate — รายการซื้อวัตถุดิบ']
    days.forEach((d) => {
      MEALS.forEach((m, mi) => {
        const r = plan[`${dateKey(d)}|${mi}`]
        if (r && r.ingredients.length > 0) {
          const dayLabel = d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
          lines.push(`\n🍽 ${r.name} (${dayLabel} · ${m.label})`)
          r.ingredients.forEach((i) => {
            const dispLabel = i.qty !== undefined
              ? `${i.name} ${num(i.qty)} ${i.unit}`
              : `${i.name}${i.measure ? ` — ${i.measure}` : ''}`
            lines.push(`  • ${dispLabel}`)
          })
        }
      })
    })
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopyMsg('คัดลอกแล้ว ✓')
      useMascot.getState().say('คัดลอกรายการซื้อของแล้ว 🛒', 'cheer')
    } catch {
      setCopyMsg('คัดลอกไม่ได้ในหน้านี้ ลองเปิดในแท็บใหม่')
    }
  }

  return (
    <>
      <h1>แผนอาหารรายสัปดาห์</h1>
      <div className="bar">
        <div>
          <button className="btn alt" onClick={() => setOffset(offset - 1)}>← สัปดาห์ก่อน</button>{' '}
          <button className="btn alt" onClick={() => setOffset(0)}>วันนี้</button>{' '}
          <button className="btn alt" onClick={() => setOffset(offset + 1)}>สัปดาห์ถัดไป →</button>
        </div>
        <span className="chip">สัปดาห์เริ่ม {days[0].getDate()}/{days[0].getMonth() + 1}</span>
        <label>🎯 เป้าแคลต่อวัน{' '}
          <input type="number" value={goal} min={0} step={100} onChange={(e) => setGoal(Number(e.target.value) || 0)} style={{ width: 110 }} />
        </label>
      </div>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th />
              {days.map((d) => (
                <th key={dateKey(d)} className={dateKey(d) === today ? 'today' : ''}>
                  {d.toLocaleDateString('th-TH', { weekday: 'short' })}<br />{d.getDate()}/{d.getMonth() + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEALS.map((m, mi) => (
              <tr key={m.label}>
                <td className="rowh">{m.icon} {m.label}</td>
                {days.map((d) => {
                  const r = plan[`${dateKey(d)}|${mi}`]
                  return (
                    <td key={dateKey(d)}>
                      <Link className="cell" to={`/day/${dateKey(d)}`} aria-label={`${d.toLocaleDateString('th-TH')} ${m.label}`}>
                        {r ? (<><Pic r={r} size={48} /><span>{r.name}</span></>) : <span style={{ opacity: 0.6 }}>＋ เพิ่ม</span>}
                      </Link>
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <td className="rowh">🔥 พลังงานรวม</td>
              {kcal.map((k, i) => (
                <td key={i} style={{ background: !k ? undefined : k > goal ? 'var(--butter)' : k >= goal * 0.8 ? 'var(--sage)' : undefined }}>
                  {k ? `${k} kcal` : '–'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p><small>แตะช่องเพื่อดูรายละเอียดและเพิ่มหรือเปลี่ยนเมนู · ช่องพลังงาน: เขียว = ใกล้เป้า (80% ขึ้นไป) · เหลือง = เกินเป้า (นับเฉพาะสูตรที่มีข้อมูลแคลอรี)</small></p>

      <section className="paper" style={{ marginTop: 34 }}>
        <h2>🛒 รายการซื้อวัตถุดิบ</h2>
        {items.length === 0 ? (
          <div className="empty" style={{ border: 0 }}>
            <Mascot mood="think" size={80} />
            <p>ยังไม่มีเมนูในสัปดาห์นี้ เพิ่มเมนูแล้วรายการซื้อจะขึ้นที่นี่</p>
          </div>
        ) : (
          <>
            <p>
              <button className="btn sage" onClick={copyList}>📋 คัดลอกรายการ</button>{' '}
              <small role="status">{copyMsg}</small>
            </p>
            {(() => {
              // รวบรวมเมนูแต่ละวัน-มื้อ พร้อมวัตถุดิบ
              const mealGroups: { key: string; label: string; recipe: (typeof plan)[string] }[] = []
              days.forEach((d) => {
                MEALS.forEach((m, mi) => {
                  const r = plan[`${dateKey(d)}|${mi}`]
                  if (r && r.ingredients.length > 0) {
                    const dayLabel = d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
                    mealGroups.push({ key: `${dateKey(d)}|${mi}`, label: `${dayLabel} · ${m.icon} ${m.label}`, recipe: r })
                  }
                })
              })
              return mealGroups.map((g) => (
                <details key={g.key} open style={{ marginBottom: 12 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700, padding: '6px 0', fontSize: 16 }}>
                    🍽 {g.recipe.name} <span style={{ fontWeight: 400, fontSize: 14, opacity: 0.7 }}>({g.label})</span>
                  </summary>
                  <div style={{ paddingLeft: 12, marginTop: 6 }}>
                    {g.recipe.ingredients.map((i) => {
                      const ck = `${weekId}|${g.key}|${i.name}`
                      const dispLabel = i.qty !== undefined
                        ? `${i.name} ${num(i.qty)} ${i.unit}`
                        : `${i.name}${i.measure ? ` — ${i.measure}` : ''}`
                      return (
                        <label key={i.name} className={`chk ${checked[ck] ? 'done' : ''}`}>
                          <input type="checkbox" checked={!!checked[ck]} onChange={() => toggleChecked(ck)} />
                          <span>{dispLabel}</span>
                        </label>
                      )
                    })}
                  </div>
                </details>
              ))
            })()}
          </>
        )}
      </section>
    </>
  )
}
