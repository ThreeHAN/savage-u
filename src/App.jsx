import './styles/main.scss'
import Navbar from './components/Navbar'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import TeamSchedule from './pages/TeamSchedule'

function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])

  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:sport/:teamName" element={<TeamSchedule />} />
      </Routes>
    </div>
  )
}

export default App
