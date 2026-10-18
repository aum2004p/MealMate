import { useStore } from '../store/useStore'

export default function Stars({ id }: { id: string }) {
  const rating = useStore((s) => s.notes[id]?.rating ?? 0)
  const setNote = useStore((s) => s.setNote)
  return (
    <div className="stars" role="group" aria-label="ให้คะแนน">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} aria-label={`ให้ ${n} ดาว`} onClick={() => setNote(id, { rating: n === rating ? 0 : n })}>
          {n <= rating ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}
