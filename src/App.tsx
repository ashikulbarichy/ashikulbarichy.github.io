import { Routes, Route, useLocation } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import SocialSidebar from './components/SocialSidebar'
import Home from './pages/Home'
import About from './components/sections/About'
import Projects from './pages/Projects'
import NotFound from './pages/NotFound'
import ScrollProgressBar from './components/ScrollProgressBar'

function App() {
  const location = useLocation();
  return (
    <div className="bg-background text-foreground antialiased">
      <ScrollProgressBar />
      {location.pathname !== '/projects' && <Navigation />}
      <SocialSidebar />
      <main className="min-h-screen main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App