import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import BlogList from './pages/BlogList'
import BlogPost from './pages/BlogPost'
import BlogEditor from './pages/BlogEditor'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import RecruiterList from './pages/RecruiterList'
import RecruiterProfile from './pages/RecruiterProfile'
import RecruiterAdmin from './pages/RecruiterAdmin'
import Apps from './pages/Apps'
import { Navbar } from './components/Navbar'
import { CyberCity } from './components/CyberCity'
import { M0tz } from './components/M0tz'
import { useReveal, stagger } from './lib/useReveal'
import { schools, faq } from './content/profile'
import { ChatWidget } from './components/ChatWidget'
import { ProtectedRoute } from './components/ProtectedRoute'
import { api, SESSION_EXPIRED_MESSAGE } from './lib/api'

function HomePage({ onContactClick }: { onContactClick: () => void }) {
  useReveal()
  return (
    <>
      <CyberCity />
      <main className="page-shell home">
        <section className="hero">
          <div className="topbar">
            <p className="eyebrow">Buenos Aires, Argentina</p>
            <button className="ghost-button" onClick={onContactClick}>
              Contact details
            </button>
          </div>

          <div className="hero-grid">
            <div className="hero-copy reveal">
              <p className="section-kicker">🧙 Personal Technovoodoo</p>
              <h1>Give me a messy real-world problem and enough Python, and I'll eventually make it an API.</h1>
              <p className="lede">
                10+ years of summoning solutions from Python, AWS, Docker, and questionable persistence.
                Backend sorcery, cloud alchemy, and the occasional dark arts involving financial records and DAW automation.
              </p>

              <div className="hero-actions">
                <Link to="/blog" className="primary-link">
                  Read Blog
                </Link>
                <a className="secondary-link" href="#faq">
                  Engineering philosophy
                </a>
              </div>
            </div>
          </div>

          <a className="scroll-cue" href="#work" aria-label="Scroll down">
            <span>scroll</span>
            <span className="scroll-cue-line" aria-hidden="true" />
          </a>
        </section>

        <section className="band reveal" id="work">
          <div className="section-heading">
            <p className="section-kicker">Schools of Sorcery</p>
            <h2>The various arcane arts and dark magic in the arsenal.</h2>
          </div>

          <div className="project-grid">
            {schools.map((school, i) => (
              <article className="project-card reveal" style={stagger(i % 3)} key={school.title}>
                <p className="project-meta" style={{ fontSize: '1.5rem' }}>{school.icon}</p>
                <h3>{school.title}</h3>
                <p>{school.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="band process-band reveal">
          <div className="section-heading">
            <p className="section-kicker">The Core Spell</p>
            <h2>"Give me a messy real-world problem and enough Python, AWS, Docker and questionable persistence, and I'll eventually make it an API."</h2>
          </div>

          <ol className="process-list">
            <li>Take an impossible requirement, a production database, and a coffee machine.</li>
            <li>Apply Python, cloud infrastructure, and mild chaos engineering.</li>
            <li>Ship something that somehow works and nobody dares to refactor.</li>
          </ol>
        </section>

        <section className="band faq-band reveal" id="faq">
          <div className="section-heading">
            <p className="section-kicker">Engineering philosophy</p>
            <h2>Python enthusiast, pragmatic backend developer, and strong believer in simple systems.</h2>
          </div>

          <div className="faq-list">
            {faq.map((item) => (
              <Disclosure as="div" className="faq-item" key={item.question}>
                <DisclosureButton className="faq-button">
                  <span>{item.question}</span>
                  <span className="faq-marker" aria-hidden="true">
                    +
                  </span>
                </DisclosureButton>
                <DisclosurePanel className="faq-panel">
                  <p>{item.answer}</p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (cache time)
    },
  },
})

// When the API rejects our tokens, drop cached data and go to the login page.
// After logging in, Login sends the user back to the page they were on.
function SessionExpiredRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    api.onSessionExpired(() => {
      queryClient.clear()
      navigate('/blog/login', {
        replace: true,
        state: { from: location, message: SESSION_EXPIRED_MESSAGE },
      })
    })
    return () => api.onSessionExpired(null)
  }, [navigate, location])

  return null
}

function AppRoutes({ onContactClick }: { onContactClick: () => void }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage onContactClick={onContactClick} />} />
      <Route path="/apps" element={<Apps />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/login" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/blog/create" element={<BlogEditor />} />
      <Route path="/blog/:slug/edit" element={<BlogEditor />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      {/* The API requires a login to read recruiters */}
      <Route
        path="/recruiters"
        element={
          <ProtectedRoute>
            <RecruiterList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiters/:id"
        element={
          <ProtectedRoute>
            <RecruiterProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/recruiters"
        element={
          <ProtectedRoute>
            <RecruiterAdmin />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [m0tzTyping, setM0tzTyping] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SessionExpiredRedirect />
        <Navbar onContactClick={() => setIsContactOpen(true)} />
        <AppRoutes onContactClick={() => setIsContactOpen(true)} />
        <ChatWidget onContactClick={() => setIsContactOpen(true)} />

        {/* Global Contact Dialog */}
        <Dialog open={isContactOpen} onClose={setIsContactOpen} className="contact-dialog">
          <DialogBackdrop className="dialog-backdrop" />
          <div className="dialog-wrap">
            <DialogPanel className="dialog-panel">
              {/* m0tz from Motz World: hover or tap and he starts typing */}
              <div className="m0tz-card">
                <button
                  type="button"
                  className="m0tz-stage"
                  aria-label="m0tz, the pixel-art character from Motz World"
                  aria-pressed={m0tzTyping}
                  onMouseEnter={() => setM0tzTyping(true)}
                  onMouseLeave={() => setM0tzTyping(false)}
                  onClick={() => setM0tzTyping((h) => !h)}
                >
                  <M0tz size={112} frame={m0tzTyping ? 'typing' : 'idle'} className="m0tz-sprite" />
                  <span className="m0tz-floor" aria-hidden="true" />
                </button>
                <div className="m0tz-bubble">
                  <p className="m0tz-name">
                    m0tz <span className="m0tz-status">online</span>
                  </p>
                  <p className="m0tz-line">
                    {m0tzTyping ? 'typing' : 'Messy problem? Ping me. I\'ll make it an API.'}
                    {m0tzTyping && <span className="m0tz-dots" aria-hidden="true" />}
                  </p>
                  <a className="m0tz-play" href="/motzworld/">
                    Play Motz World →
                  </a>
                </div>
              </div>

              <p className="section-kicker kicker-with-icon">
                <M0tz size={20} /> Summon the Wizard
              </p>
              <h2>Agustin Enriquez — Technovoodoo Practitioner</h2>
              <p className="dialog-copy">
                10+ years of Python sorcery, AWS cloud alchemy, and production archaeology.
                Open to remote work across US, EU, and Asia timezones.
              </p>

              <div className="dialog-grid">
                <div>
                  <p className="dialog-label">Reach me</p>
                  <p>Buenos Aires, Argentina - cagustinenriquez@gmail.com - +54 11 3820-3567</p>
                </div>
                <div>
                  <p className="dialog-label">LinkedIn</p>
                  <p>
                    <a href="https://www.linkedin.com/in/agustin-e-00205055/" target="_blank" rel="noreferrer">
                      linkedin.com/in/agustin-e-00205055
                    </a>
                  </p>
                </div>
              </div>

              <button className="ghost-button close-button" onClick={() => setIsContactOpen(false)}>
                Close
              </button>
            </DialogPanel>
          </div>
        </Dialog>
      </Router>
    </QueryClientProvider>
  )
}

export default App
