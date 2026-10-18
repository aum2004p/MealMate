import { useState } from 'react'
import type { Recipe } from '../types'

const IDX: Record<string, number> = { จานเดียว: 0, ซุปและแกง: 1, ยำและสลัด: 2, ของหวาน: 3 }

export default function Pic({ r, big, size }: { r: Recipe; big?: boolean; size?: number }) {
  // จำ src ที่โหลดไม่ได้ไว้ แล้วถอยกลับไปใช้อีโมจิแทน
  const [badSrc, setBadSrc] = useState('')
  if (r.thumb && badSrc !== r.thumb) {
    const src = r.source === 'api' && !big ? `${r.thumb}/preview` : r.thumb
    return (
      <img
        className={big ? 'thumb big' : 'thumb'}
        src={src}
        alt={r.name}
        loading="lazy"
        onError={() => setBadSrc(r.thumb)}
        style={size ? { width: size, height: size } : undefined}
      />
    )
  }
  return (
    <div
      className={`pic c${IDX[r.category] ?? 0}${big ? ' big' : ''}`}
      role="img"
      aria-label={r.name}
      style={size ? { width: size, height: size, fontSize: size * 0.5 } : undefined}
    >
      {r.emoji ?? '🍽'}
    </div>
  )
}
