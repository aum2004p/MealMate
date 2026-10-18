import { useEffect, useRef, useState } from 'react'

export type Mood = 'hi' | 'cheer' | 'think' | 'cook'

interface Props {
  mood?: Mood
  size?: number
  /** เด้งเมื่อเอาเมาส์ชี้ */
  interactive?: boolean
  /** ลูกตามองตามเมาส์ */
  follow?: boolean
  /** หมุนตัวหนึ่งรอบ */
  spin?: boolean
}

export default function Mascot({ mood = 'hi', size = 100, interactive = false, follow = false, spin = false }: Props) {
  const ref = useRef<SVGSVGElement>(null)
  const [look, setLook] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!follow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        const b = el.getBoundingClientRect()
        const dx = (e.clientX - (b.left + b.width / 2)) / 300
        const dy = (e.clientY - (b.top + b.height / 2)) / 300
        setLook({ x: Math.max(-1, Math.min(1, dx)) * 2.5, y: Math.max(-1, Math.min(1, dy)) * 2 })
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [follow])

  const eyeY = mood === 'think' ? 46 : 49
  return (
    <svg
      ref={ref}
      className={`mm${interactive ? ' interactive' : ''}${spin ? ' spin' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="มาสคอตเชฟ MealMate"
      stroke="#755342"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <ellipse className="mm-shadow" cx="50" cy="96" rx="26" ry="3.5" fill="#755342" fillOpacity={0.15} stroke="none" />
      <g className="mm-bob">
        <ellipse cx="50" cy="62" rx="34" ry="30" fill="#FFF0C4" />
        <g className="mm-hat">
          <path d="M28 34a14 14 0 0 1 8-22 14 14 0 0 1 28 0 14 14 0 0 1 8 22z" fill="#FFF8ED" />
          <rect x="30" y="32" width="40" height="8" rx="3" fill="#FFF8ED" />
        </g>
        <g transform={`translate(${look.x} ${look.y})`}>
          {mood === 'cheer' ? (
            <path d="M35 48q4-6 8 0M57 48q4-6 8 0" fill="none" />
          ) : (
            <g className="mm-eyes">
              <circle cx="39" cy={eyeY} r="3.5" fill="#755342" />
              <circle cx="61" cy={eyeY} r="3.5" fill="#755342" />
            </g>
          )}
        </g>
        <ellipse className="mm-cheek" cx="30" cy="58" rx="6" ry="4" fill="#D99AA5" stroke="none" />
        <ellipse className="mm-cheek" cx="70" cy="58" rx="6" ry="4" fill="#D99AA5" stroke="none" />
        {mood === 'hi' && <path d="M42 58q8 8 16 0" fill="none" />}
        {mood === 'cheer' && <path d="M42 56q8 14 16 0z" fill="#b5566a" />}
        {mood === 'think' && <circle cx="50" cy="60" r="3" fill="#755342" />}
        {mood === 'cook' && <path d="M43 58q7 6 14 0" fill="none" />}
        <g className={`mm-arm${mood === 'cheer' ? ' fast' : ''}`}>
          <path d="M82 66l10-14" />
          <ellipse cx="94" cy="48" rx="6" ry="4.5" fill="#D99AA5" transform="rotate(-50 94 48)" />
        </g>
      </g>
      {mood === 'think' && (
        <text className="mm-q" x="74" y="30" fontSize="16" fill="#755342" stroke="none">?</text>
      )}
      {mood === 'cook' && (
        <>
          <path className="mm-steam" d="M30 20q-4-6 0-10" fill="none" />
          <path className="mm-steam" d="M42 18q-4-6 0-10" fill="none" style={{ animationDelay: '0.6s' }} />
        </>
      )}
      {mood === 'cheer' && (
        <g fill="#D99AA5" stroke="none" fontSize="14">
          <text className="mm-spark" x="6" y="34">✦</text>
          <text className="mm-spark" x="84" y="28" style={{ animationDelay: '0.4s' }}>✦</text>
          <text className="mm-spark" x="20" y="12" style={{ animationDelay: '0.8s' }}>✦</text>
        </g>
      )}
    </svg>
  )
}
