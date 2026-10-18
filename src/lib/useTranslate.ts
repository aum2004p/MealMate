import { useState, useEffect, useRef } from 'react'

// แปลข้อความหลายรายการจากอังกฤษเป็นไทยด้วย MyMemory API
// แสดงข้อความต้นฉบับก่อน แล้วค่อยแทนด้วยคำแปลเมื่อพร้อม

const cache = new Map<string, string>()

async function translateOne(text: string): Promise<string> {
  if (!text.trim()) return text
  if (cache.has(text)) return cache.get(text)!
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|th`
    const res = await fetch(url)
    if (!res.ok) return text
    const data = await res.json()
    const translated: string = data?.responseData?.translatedText ?? text
    cache.set(text, translated)
    return translated
  } catch {
    return text
  }
}

// แปลทีละ batch เพื่อไม่ให้ rate limit
async function translateBatch(texts: string[]): Promise<string[]> {
  const results: string[] = []
  for (const t of texts) {
    const r = await translateOne(t)
    results.push(r)
    // หน่วงเล็กน้อยระหว่างแต่ละ request
    await new Promise((res) => setTimeout(res, 120))
  }
  return results
}

export function useTranslateList(texts: string[], enabled = true) {
  const [translated, setTranslated] = useState<string[]>(texts)
  const [loading, setLoading] = useState(false)
  const keyRef = useRef('')

  useEffect(() => {
    if (!enabled || texts.length === 0) {
      setTranslated(texts)
      return
    }
    const key = texts.join('||')
    if (key === keyRef.current) return
    keyRef.current = key

    // แสดงต้นฉบับก่อนทันที
    setTranslated(texts)
    setLoading(true)

    translateBatch(texts).then((result) => {
      setTranslated(result)
      setLoading(false)
    })
  }, [texts, enabled])

  return { translated, loading }
}
