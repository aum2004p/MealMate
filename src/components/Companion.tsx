import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLocation } from 'react-router-dom'
import Mascot from './Mascot'
import type { Mood } from './Mascot'
import { useMascot } from '../store/useMascot'

const MUTE_KEY = 'mealmate-mute'
const EMO = ['🎉', '⭐', '💗', '✨']
const GENERAL = [
  'ลองกดสุ่มเมนูดูสิ!',
  'อย่าลืมตั้งเป้าแคลต่อวันที่หน้าแผนอาหารนะ',
  'แพ้อาหาร? ตั้งตัวกรองได้ที่หน้าสูตรอาหาร',
  'กดที่ฉันได้ตลอดเลยนะ',
]

function tipFor(path: string): { text: string; mood: Mood } | null {
  if (path === '/' || path === '') return null
  if (path.startsWith('/recipes')) return { text: 'เจอเมนูที่ถูกใจแล้วกดบันทึกไว้นะ', mood: 'think' }
  if (path.startsWith('/recipe/')) return { text: 'กด “โหมดทำอาหาร” ได้นะ มีจับเวลาด้วย', mood: 'hi' }
  if (path.startsWith('/cook/')) return { text: 'ตั้งใจทำนะ! ฉันเชียร์อยู่', mood: 'cook' }
  if (path.startsWith('/plan')) return { text: 'จัดแผนทั้งสัปดาห์ แล้วคัดลอกรายการซื้อของได้เลย', mood: 'think' }
  if (path.startsWith('/day/')) return { text: 'เลือกเมนูให้ครบสามมื้อกันเถอะ', mood: 'cook' }
  if (path.startsWith('/collection')) return { text: 'สูตรโปรดของเธออยู่ที่นี่หมดเลย', mood: 'cheer' }
  if (path.startsWith('/about')) return { text: 'MealMate ยินดีที่ได้รู้จัก!', mood: 'hi' }
  return null
}

export default function Companion() {
  const { pathname } = useLocation()
  const msg = useMascot((s) => s.msg)
  const say = useMascot((s) => s.say)
  const clear = useMascot((s) => s.clear)
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [taps, setTaps] = useState(0)

  useEffect(() => {
    if (muted) return
    // ถ้าเพิ่งมีข้อความจากการกระทำ (เช่น ทำเสร็จแล้ว) ไม่ให้คำแนะนำประจำหน้าไปทับ
    const cur = useMascot.getState().msg
    if (cur && Date.now() - cur.at < 2000) return
    const tip = tipFor(pathname)
    if (tip) say(tip.text, tip.mood)
  }, [pathname, muted, say])

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(clear, 5000)
    return () => clearTimeout(t)
  }, [msg, clear])

  function toggleMute() {
    const next = !muted
    setMuted(next)
    clear()
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0')
    } catch {
      /* เก็บค่าไม่ได้ก็ไม่เป็นไร */
    }
  }

  function tap() {
    const n = taps + 1
    setTaps(n)
    say(GENERAL[n % GENERAL.length], n % 2 ? 'cheer' : 'hi')
  }

  return (
    <div className="companion">
      {msg && (
        <div className="bubble" role="status" key={msg.id}>
          {msg.text}
          <button className="bubble-x" aria-label="ปิดข้อความ" onClick={clear}>×</button>
        </div>
      )}
      {msg?.burst && (
        <div className="confetti" key={`c${msg.id}`} aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2
            const d = 70 + (i % 3) * 22
            const style = {
              '--dx': `${Math.cos(a) * d}px`,
              '--dy': `${Math.sin(a) * d - 30}px`,
              '--rot': `${(i % 2 ? 1 : -1) * (120 + i * 20)}deg`,
            } as CSSProperties
            return <span key={i} style={style}>{EMO[i % 4]}</span>
          })}
        </div>
      )}
      <div className="companion-row">
        <button className="mute-btn" onClick={toggleMute} aria-pressed={muted} aria-label="ปิดคำแนะนำประจำหน้า" title="ปิด/เปิดคำแนะนำประจำหน้า">
          {muted ? '🔕' : '🔔'}
        </button>
        <button className="mascot-btn" onClick={tap} aria-label="คุยกับมาสคอต">
          <Mascot mood={msg?.mood ?? 'hi'} size={76} interactive follow />
        </button>
      </div>
    </div>
  )
}
