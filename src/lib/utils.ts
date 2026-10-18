import type { Recipe } from '../types'

export const MEALS = [
  { icon: '🌅', label: 'มื้อเช้า' },
  { icon: '☀️', label: 'มื้อกลางวัน' },
  { icon: '🌙', label: 'มื้อเย็น' },
]

export const num = (n: number) => String(Math.round(n * 10) / 10)

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const longDate = (d: Date) =>
  d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function weekDays(offset: number): Date[] {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return x
  })
}

/** คูณตัวเลขนำหน้าในปริมาณ เช่น "1 1/2 cups" ถ้าอ่านตัวเลขไม่ได้จะคืนค่าเดิม */
export function scaleMeasure(measure: string, factor: number): string {
  if (factor === 1) return measure
  const r = measure.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(.*)$/)
  if (!r) return measure
  const n = r[1].split(/\s+/).reduce((sum, p) => {
    if (p.includes('/')) {
      const [a, b] = p.split('/').map(Number)
      return sum + a / b
    }
    return sum + Number(p)
  }, 0)
  return `${Math.round(n * factor * 100) / 100} ${r[2]}`.trim()
}

export interface AvGroup {
  label: string
  kw: string[]
  skip?: string[]
}

export const AV: Record<string, AvGroup> = {
  veg: {
    label: 'ไม่กินเนื้อสัตว์ (กินไข่/นมได้)',
    kw: ['chicken', 'beef', 'pork', 'lamb', 'mutton', 'bacon', 'ham', 'sausage', 'mince', 'turkey', 'duck', 'veal', 'fish', 'salmon', 'tuna', 'cod', 'prawn', 'shrimp', 'crab', 'lobster', 'oyster', 'squid', 'mussel', 'clam', 'anchov', 'gelatin', 'อกไก่', 'เนื้อไก่', 'หมู', 'กุ้ง', 'น้ำปลา', 'หอยนางรม', 'น้ำซุป'],
  },
  shell: { label: 'แพ้กุ้ง/หอย/ปู', kw: ['prawn', 'shrimp', 'crab', 'lobster', 'oyster', 'mussel', 'clam', 'scallop', 'squid', 'กุ้ง', 'หอยนางรม'] },
  pork: { label: 'ไม่กินหมู', kw: ['pork', 'bacon', 'ham', 'sausage', 'chorizo', 'pancetta', 'prosciutto', 'lard', 'หมู'] },
  egg: { label: 'แพ้ไข่', kw: ['egg', 'ไข่'] },
  nut: { label: 'แพ้ถั่ว', kw: ['peanut', 'almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'pistachio', 'ถั่วลิสง'] },
  milk: {
    label: 'แพ้นม',
    kw: ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'ghee', 'นม'],
    skip: ['coconut', 'peanut'],
  },
  gluten: {
    label: 'แพ้แป้งสาลี/กลูเตน',
    kw: ['flour', 'bread', 'pasta', 'spaghetti', 'noodle', 'soy sauce', 'couscous', 'tortilla', 'pastry', 'wheat', 'barley', 'macaroni', 'lasagne', 'แป้งสาลี', 'ซีอิ๊ว'],
  },
  spicy: { label: 'ไม่กินเผ็ด', kw: ['chilli', 'chili', 'cayenne', 'jalapeno', 'tabasco', 'harissa', 'พริก'] },
}

/** คืนรายชื่อวัตถุดิบที่ชนกับข้อจำกัด (เทียบจากชื่อวัตถุดิบเท่านั้น) */
export function avoidHits(r: Recipe, groups: string[], custom: string): string[] {
  if (!r.detailed) return []
  const extra = custom
    .split(/[,،]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return r.ingredients
    .map((i) => i.name)
    .filter((name) => {
      const l = name.toLowerCase()
      const byGroup = groups.some((g) => {
        const a = AV[g]
        return !!a && a.kw.some((k) => l.includes(k)) && !(a.skip ?? []).some((s) => l.includes(s))
      })
      return byGroup || extra.some((e) => l.includes(e))
    })
}
