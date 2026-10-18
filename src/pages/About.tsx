import Mascot from '../components/Mascot'

const TEAM = [
  {
    name: 'ณัฐริกา บุญส่ง',
    id: '1660701846',
    roles: ['Frontend Developer', 'UX/UI', 'Tester'],
    photo: '/images/aum.jpg',
    mood: 'hi' as const,
  },
  {
    name: 'มินทร์ตรา พรรณเขียวหวาน',
    id: '1660702166',
    roles: ['Frontend Developer', 'UX/UI' , 'เชื่อมต่อข้อมูล'],
    photo: '/images/mild.jpg',
    mood: 'cook' as const,
  },
]

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  'Frontend Developer': { bg: '#c51633', color: '#fff' },
  'UX/UI':             { bg: '#7848c0', color: '#fff' },
  'Tester':            { bg: '#28b17b', color: '#fff' },
  'เชื่อมต่อข้อมูล':   { bg: '#c07a1a', color: '#fff' },
}

export default function About() {
  return (
    <>
      <section className="hero">
        <div>
          <h1>เกี่ยวกับ MealMate</h1>
          <p style={{ margin: 0 }}>เว็บไซต์ค้นหาสูตรอาหารและวางแผนมื้ออาหาร ให้ทุกมื้อในสัปดาห์เป็นเรื่องง่ายและน่ารัก</p>
        </div>
        <div className="mascot"><Mascot mood="cheer" size={120} /></div>
      </section>
      <div className="two" style={{ marginTop: 30 }}>
        <section className="paper">
          <h2>ที่มาและวัตถุประสงค์</h2>
          <p>MealMate ช่วยให้ผู้ใช้หาสูตร เก็บสูตรโปรด และจัดแผนอาหารพร้อมรายการซื้อวัตถุดิบไว้ในที่เดียว ลดเวลาคิดว่าจะกินอะไรดี</p>
        </section>
        <section className="paper">
          <h2>เทคโนโลยีและข้อมูล</h2>
          <p className="chips" style={{ marginTop: 0 }}>
            {([
              { label: 'React',          bg: '#149eca', color: '#fff' },
              { label: 'TypeScript',     bg: '#c63176', color: '#fff' },
              { label: 'Zustand',        bg: '#c07a1a', color: '#fff' },
              { label: 'TanStack Query', bg: '#2e7d5e', color: '#fff' },
            ]).map((t) => (
              <span
                key={t.label}
                className="chip"
                style={{ background: t.bg, color: t.color, border: 'none', fontWeight: 700 }}
              >{t.label}</span>
            ))}
          </p>
          <p>แหล่งข้อมูลสูตรอาหาร: TheMealDB API</p>
        </section>
      </div>
      <section className="paper">
        <h2>ทีมพัฒนา</h2>
        <div className="grid">
          {TEAM.map((t) => (
            <div className="card" style={{ alignItems: 'center', textAlign: 'center' }} key={t.id}>
              <img
                src={t.photo}
                alt={t.name}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid var(--brown)',
                  marginBottom: 4,
                }}
              />
              <h3 style={{ margin: '4px 0 2px' }}>{t.name}</h3>
              <small style={{ color: 'var(--brown)', opacity: 0.7 }}>{t.id}</small>
              <p className="chips" style={{ justifyContent: 'center', marginTop: 8 }}>
                {t.roles.map((r) => (
                  <span
                    key={r}
                    className="chip"
                    style={{
                      background: ROLE_COLORS[r]?.bg ?? '#888',
                      color: ROLE_COLORS[r]?.color ?? '#fff',
                      border: 'none',
                      fontWeight: 700,
                    }}
                  >{r}</span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
