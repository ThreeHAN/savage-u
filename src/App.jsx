import './styles/main.scss'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Teams from './components/Teams'
import Coaching from './components/Coaching'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Teams />
      <Coaching />
    </div>
  )
}

export default App
