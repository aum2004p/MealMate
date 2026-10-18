import { NavLink, Route, Routes } from 'react-router-dom'
import Mascot from './components/Mascot'
import Companion from './components/Companion'
import Home from './pages/Home'
import Browse from './pages/Browse'
import RecipeDetail from './pages/RecipeDetail'
import CookMode from './pages/CookMode'
import Planner from './pages/Planner'
import DayDetail from './pages/DayDetail'
import Collection from './pages/Collection'
import About from './pages/About'

const NAV = [
  { to: '/', label: 'หน้าหลัก', end: true },
  { to: '/recipes', label: 'สูตรอาหาร' },
  { to: '/plan', label: 'แผนอาหาร' },
  { to: '/collection', label: 'คอลเลกชัน' },
  { to: '/about', label: 'เกี่ยวกับเรา' },
]

export default function App() {
  return (
    <>
      <header>
        <div className="wrap">
          <NavLink className="logo" to="/"><Mascot mood="hi" size={38} />MealMate</NavLink>
          <nav aria-label="เมนูหลัก">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>)}
          </nav>
        </div>
      </header>
      <main>
        <div className="wrap">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<Browse home={false} />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/cook/:id" element={<CookMode />} />
            <Route path="/plan" element={<Planner />} />
            <Route path="/day/:date" element={<DayDetail />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </main>
      <footer>MealMate · สมุดสูตรอาหารพาสเทล · ข้อมูลจาก TheMealDB</footer>
      <Companion />
    </>
  )
}
