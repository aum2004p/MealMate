export interface Ingredient {
  name: string
  measure: string
  /** ตัวเลขและหน่วยแยกกัน (เฉพาะสูตรตัวอย่างไทย) ใช้คำนวณตามจำนวนเสิร์ฟ */
  qty?: number
  unit?: string
}

export interface Recipe {
  id: string
  name: string
  category: string
  area: string
  thumb: string
  youtube: string
  steps: string[]
  ingredients: Ingredient[]
  /** false = ข้อมูลแบบย่อจาก filter.php (ยังไม่มีวัตถุดิบและขั้นตอน) */
  detailed: boolean
  source: 'local' | 'api'
  emoji?: string
  desc?: string
  prep?: number
  cook?: number
  difficulty?: string
  servings?: number
  kcal?: number
  protein?: number
  timers?: number[]
}
