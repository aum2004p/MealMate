import type { ReactNode } from 'react'
import Mascot from './Mascot'

export function Loading({ text = 'กำลังโหลด...' }: { text?: string }) {
  return (
    <div className="empty" role="status" style={{ gridColumn: '1/-1' }}>
      <Mascot mood="cook" size={90} />
      <p>{text}</p>
    </div>
  )
}

export function ErrorBox({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
  return (
    <div className="empty" role="alert" style={{ gridColumn: '1/-1' }}>
      <Mascot mood="think" size={90} />
      <h3>เกิดข้อผิดพลาด</h3>
      <p>{msg} ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่</p>
      {onRetry && <button className="btn" onClick={onRetry}>🔄 ลองใหม่</button>}
    </div>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty" style={{ gridColumn: '1/-1' }}>
      <Mascot mood="think" size={90} />
      <h3>{title}</h3>
      {children}
    </div>
  )
}
