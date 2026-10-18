import { useStore } from '../store/useStore'
import { AV } from '../lib/utils'

export default function AvoidBox() {
  const avoid = useStore((s) => s.avoid)
  const toggleGroup = useStore((s) => s.toggleGroup)
  const setCustom = useStore((s) => s.setCustom)
  const n = avoid.groups.length + (avoid.custom.trim() ? 1 : 0)
  return (
    <details className="paper" open={n > 0} style={{ marginTop: 22 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
        🚫 ตัวกรองข้อจำกัดอาหาร (แพ้/ไม่ชอบ){' '}
        {n > 0 && <span className="chip">เปิดใช้ {n} รายการ</span>}
      </summary>
      <div className="chips">
        {Object.entries(AV).map(([k, g]) => (
          <label className="chk" key={k}>
            <input type="checkbox" checked={avoid.groups.includes(k)} onChange={() => toggleGroup(k)} />
            <span>{g.label}</span>
          </label>
        ))}
      </div>
      <input
        type="search"
        value={avoid.custom}
        onChange={(e) => setCustom(e.target.value)}
        placeholder="อย่างอื่นที่ไม่กิน (ชื่อภาษาอังกฤษ) เช่น tomato, basil — คั่นด้วยจุลภาค"
        aria-label="วัตถุดิบอื่นที่ไม่กิน"
      />
      <p style={{ marginBottom: 0 }}>
        <small>กรองจากชื่อวัตถุดิบเท่านั้น และใช้กับเมนูที่โหลดรายละเอียดแล้ว หากแพ้อาหารรุนแรง โปรดตรวจฉลากและวัตถุดิบจริงทุกครั้ง</small>
      </p>
    </details>
  )
}
