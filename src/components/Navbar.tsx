import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '@/lib/api'

interface NavbarProps {
  onContactClick?: () => void
  showBack?: boolean
}

const GLYPHS = '01<>/{}[]#$%&*+=?λ'

// A menu label that "decrypts" when the mobile menu opens: random glyphs that settle
// into the real word, left to right. Screen readers always get the plain word.
function MagicLabel({ text, active, delay }: { text: string; active: boolean; delay: number }) {
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (!active || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const frames = 10
    let frame = 0
    let tick: number | undefined
    const start = window.setTimeout(() => {
      tick = window.setInterval(() => {
        frame++
        const solved = Math.floor((frame / frames) * text.length)
        setShown(
          [...text].map((ch, i) => (i < solved || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(''),
        )
        if (frame >= frames) {
          window.clearInterval(tick)
          setShown(text)
        }
      }, 35)
    }, delay)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(tick)
      setShown(text)
    }
  }, [active, text, delay])

  return (
    <>
      <span aria-hidden="true">{shown}</span>
      <span className="visually-hidden">{text}</span>
    </>
  )
}

// Stagger order for the menu items' entrance
const order = (i: number) => ({ '--i': i }) as CSSProperties
const STEP = 70 // ms between items, matches the CSS animation delay

export function Navbar({ onContactClick, showBack }: NavbarProps) {
  const [open, setOpen] = useState(false)
  // Re-render on navigation so Admin/Logout reflect login state right away
  useLocation()

  const menuRef = useRef<HTMLDivElement>(null)

  // While the mobile menu is open: Esc closes it, and the right-edge fade shows only
  // while there are more links to swipe to
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const el = menuRef.current
    const updateFade = () => el?.classList.toggle('can-scroll', !!el && el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    updateFade()
    document.addEventListener('keydown', onKey)
    el?.addEventListener('scroll', updateFade, { passive: true })
    window.addEventListener('resize', updateFade)
    return () => {
      document.removeEventListener('keydown', onKey)
      el?.removeEventListener('scroll', updateFade)
      window.removeEventListener('resize', updateFade)
    }
  }, [open])

  const links = [
    { label: 'Blog', to: '/blog', router: true },
    { label: 'Work', to: '/#work' },
    { label: 'Philosophy', to: '/#faq' },
    { label: 'Game', to: '/motzworld/' },
  ]
  const magic = (i: number) => ({ active: open, delay: 120 + i * STEP })

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark sticky-top${open ? ' menu-open' : ''}`}>
      <div className="container-fluid px-4">
        <div className="navbar-brand-wrap d-flex align-items-center gap-2">
          <Link className="navbar-brand m-0" to="/" style={{ color: '#0ea5e9', fontSize: '1.1rem' }}>
            ae
          </Link>
          {showBack && (
            <Link to="/blog" className="btn btn-sm btn-primary">
              Back to posts
            </Link>
          )}
        </div>
        <button
          className="navbar-toggler spell-toggler"
          type="button"
          onClick={() => setOpen(!open)}
          aria-controls="navbarNav"
          aria-expanded={open}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
        >
          <span className="burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        {/* On phones and tablets the links appear inside the bar itself, one by one */}
        <div
          ref={menuRef}
          className="navbar-collapse bar-menu"
          id="navbarNav"
          onClick={(e) => {
            // Picking any link or button in the menu closes it
            if ((e.target as HTMLElement).closest('a, button')) setOpen(false)
          }}
        >
          <ul className="navbar-nav mx-auto">
            {links.map((l, i) => (
              <li className="nav-item" style={order(i)} key={l.label}>
                {l.router ? (
                  <Link className="nav-link" to={l.to}>
                    <MagicLabel text={l.label} {...magic(i)} />
                  </Link>
                ) : (
                  <a className="nav-link" href={l.to}>
                    <MagicLabel text={l.label} {...magic(i)} />
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" style={order(links.length)} onClick={onContactClick}>
              <MagicLabel text="Contact" {...magic(links.length)} />
            </button>
            {api.isAuthenticated() && (
              <>
                <Link to="/admin" className="btn btn-outline-primary" style={order(links.length + 1)}>
                  <MagicLabel text="Admin" {...magic(links.length + 1)} />
                </Link>
                <button
                  className="btn btn-outline-secondary"
                  style={order(links.length + 2)}
                  onClick={() => {
                    api.logout()
                    window.location.reload()
                  }}
                >
                  <MagicLabel text="Logout" {...magic(links.length + 2)} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
