import { useState } from 'react'
import Mascot, { type Mood } from './Mascot'

const LINES: { mood: Mood; text: string }[] = [
  { mood: 'hi', text: 'สวัสดี! เลือกเมนูอร่อยกันเลย' },
  { mood: 'cook', text: 'ฉันกำลังผัดอยู่ หอมมากเลย~' },
  { mood: 'cheer', text: 'เย้! วันนี้ต้องอร่อยแน่ ๆ' },
  { mood: 'think', text: 'อืม... วันนี้กินอะไรดีนะ?' },
]
const TICKLE: { mood: Mood; text: string } = { mood: 'cheer', text: 'จั๊กจี้นะ! 😆' }

export default function MascotHero() {
  const [clicks, setClicks] = useState(0)
  const [spin, setSpin] = useState(false)
  const line = clicks > 0 && clicks % 6 === 0 ? TICKLE : LINES[clicks % LINES.length]

  function poke() {
    const n = clicks + 1
    setClicks(n)
    if (n % 6 === 0) {
      setSpin(true)
      setTimeout(() => setSpin(false), 800)
    }
  }

  return (
    <div className="mascot">
      <div className="bubble" key={clicks} aria-live="polite">{line.text}</div>
      <button className="mascot-btn" onClick={poke} aria-label="คลิกเพื่อคุยกับมาสคอต">
        <Mascot mood={line.mood} size={140} interactive follow spin={spin} />
      </button>
    </div>
  )
}
