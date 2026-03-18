import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { useState } from 'react'
import './App.css'

const projects = [
  {
    title: 'Backend architecture',
    summary:
      'Scalable backend platforms, high-throughput APIs, and cloud-native services built with Python and a strong focus on maintainability.',
    meta: 'Python, Django, Flask, FastAPI',
  },
  {
    title: 'Data-intensive systems',
    summary:
      'ETLs, database-heavy applications, and performance work across PostgreSQL, DynamoDB, and production delivery pipelines.',
    meta: 'PostgreSQL, DynamoDB, ETLs',
  },
  {
    title: 'Engineering workflow',
    summary:
      'Readable code, profiling, CI pipelines, testing discipline, and pragmatic decisions that help teams ship on time.',
    meta: 'TDD, CI, profiling, Agile',
  },
] as const

const process = [
  'Design systems around clear architecture, performance, and long-term maintainability.',
  'Build with Python-first tools and keep delivery pragmatic and cloud-native.',
  'Share practical notes from real engineering work, not abstract theory.',
] as const

const faq = [
  {
    question: 'Why keep the site static?',
    answer:
      'A static site keeps the blog fast, simple to deploy, and easy to maintain while the focus stays on content and engineering work.',
  },
  {
    question: 'What do I work with most?',
    answer:
      'Python, Django, Flask, FastAPI, JavaScript, Vue.js, PostgreSQL, DynamoDB, Docker, AWS, REST APIs, and ETL workflows.',
  },
  {
    question: 'What is the core engineering philosophy here?',
    answer:
      'Simple is better than complex. Keep code readable, follow solid engineering practices, profile real bottlenecks, and ship maintainable systems.',
  },
] as const

function App() {
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <>
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
              <p className="section-kicker">Agustin Enriquez Python Developer Blog</p>
              <h1>Staff-level Python engineer building scalable backend platforms and high-throughput APIs.</h1>
              <p className="lede">
                Staff-level engineer with 10+ years building scalable backend platforms,
                high-throughput APIs, and data-intensive systems with a strong focus on
                architecture, performance optimization, and cloud-native delivery.
              </p>

              <div className="hero-actions">
                <a className="primary-link" href="#work">
                  Core strengths
                </a>
                <a className="secondary-link" href="#faq">
                  Engineering philosophy
                </a>
              </div>
            </div>

            <aside className="hero-panel" aria-label="Project snapshot">
              <p className="panel-label">Contact</p>
              <ul className="stack-list">
                <li>cagustinenriquez@gmail.com</li>
                <li>+54 11 3820-3567</li>
                <li>Open to Remote</li>
                <li>US / EU / Asia</li>
                <li>LinkedIn profile</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="band" id="work">
          <div className="section-heading">
            <p className="section-kicker">Core strengths</p>
            <h2>Backend systems, performance work, and Python-first delivery.</h2>
          </div>

          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.title}>
                <p className="project-meta">{project.meta}</p>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="band process-band">
          <div className="section-heading">
            <p className="section-kicker">Summary</p>
            <h2>Clean, readable, batteries-included engineering with a strong delivery mindset.</h2>
          </div>

          <ol className="process-list">
            {process.map((step) => (
              <li key={step}>{step}</li>
            ))}
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
            <p className="section-kicker">Contact</p>
            <h2>Agustin Enriquez Python Developer Blog</h2>
            <p className="dialog-copy">
              Python enthusiast focused on FastAPI, Django, and Flask development, with
              10+ years building systems that hold up under real-world traffic.
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

export default App
