import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import BlogList from './pages/BlogList'
import BlogPost from './pages/BlogPost'
import BlogEditor from './pages/BlogEditor'
import Login from './pages/Login'
import { Navbar } from './components/Navbar'

const schools = [
  {
    icon: '🐍',
    title: 'Python sorcery',
    summary: 'Django, Flask, FastAPI, async, multiprocessing, data processing, Pandas/Polars.',
  },
  {
    icon: '☁️',
    title: 'Cloud alchemy',
    summary: 'AWS, S3, Lambda, Step Functions, RDS, IAM, queues and event-driven systems.',
  },
  {
    icon: '🧱',
    title: 'Container necromancy',
    summary: 'Docker, Kubernetes, Terraform, deployments that somehow work despite nobody completely understanding why.',
  },
  {
    icon: '📨',
    title: 'Message-passing mysticism',
    summary: 'Kafka, RabbitMQ, SQS, WebSockets, real-time processing.',
  },
  {
    icon: '🧠',
    title: 'AI summoning',
    summary: 'RAG, agents, LLM APIs, MCP, vector databases, LLM evaluation.',
  },
  {
    icon: '🏦',
    title: 'Financial dark arts',
    summary: 'Loan risk, fraud/AML processes, direct debits, millions of financial records.',
  },
  {
    icon: '🎛️',
    title: 'DAW wizardry',
    summary: 'REAPER + Lua + FastAPI + an AI agent that actually manipulates tracks.',
  },
  {
    icon: '🔌',
    title: '"Let\'s just connect it" engineering',
    summary: 'Bluetooth/Wi-Fi detection, OCR, external systems, APIs, legacy enterprise software.',
  },
  {
    icon: '🩹',
    title: 'Production archaeology',
    summary: 'Taking an existing system nobody wants to touch and figuring out why the hell it works.',
  },
] as const

const faq = [
  {
    question: 'Why the technovoodoo branding?',
    answer:
      'Because "Software Engineer" is boring, and most of what happens in production feels like magic anyway. Might as well lean into it.',
  },
  {
    question: 'So you actually know what you\'re doing, or...?',
    answer:
      'Mostly. 10+ years of production systems, 10 billion+ records, millions in financial transactions. The API jokes are real, the wins are real, the production archaeology is very real.',
  },
  {
    question: 'Why Python, AWS, Docker, and "questionable persistence"?',
    answer:
      'Python is readable and gets stuff done. AWS scales without breaking. Docker makes deployments less terrifying. And "questionable persistence" is a fancy way of saying I\'ve built systems that work despite architectural decisions that made architects cry.',
  },
] as const

function HomePage() {
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <>
      <Navbar onContactClick={() => setIsContactOpen(true)} />

      <main className="page-shell">
        <section className="hero">
          <div className="topbar">
            <p className="eyebrow">Buenos Aires, Argentina</p>
            <button className="ghost-button" onClick={() => setIsContactOpen(true)}>
              Contact details
            </button>
          </div>

          <div className="hero-grid">
            <div className="hero-copy">
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
        </section>

        <section className="band" id="work">
          <div className="section-heading">
            <p className="section-kicker">Schools of Sorcery</p>
            <h2>The various arcane arts and dark magic in the arsenal.</h2>
          </div>

          <div className="project-grid">
            {schools.map((school) => (
              <article className="project-card" key={school.title}>
                <p className="project-meta" style={{ fontSize: '1.5rem' }}>{school.icon}</p>
                <h3>{school.title}</h3>
                <p>{school.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="band process-band">
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

        <section className="band faq-band" id="faq">
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

      <Dialog open={isContactOpen} onClose={setIsContactOpen} className="contact-dialog">
        <DialogBackdrop className="dialog-backdrop" />
        <div className="dialog-wrap">
          <DialogPanel className="dialog-panel">
            <p className="section-kicker">🧙 Summon the Wizard</p>
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/login" element={<Login />} />
          <Route path="/blog/create" element={<BlogEditor />} />
          <Route path="/blog/:slug/edit" element={<BlogEditor />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
