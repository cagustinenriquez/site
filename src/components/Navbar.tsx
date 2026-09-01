import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'

interface NavbarProps {
  onContactClick?: () => void
  showBack?: boolean
}

export function Navbar({ onContactClick, showBack }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ background: 'rgba(26, 26, 26, 0.95)', backdropFilter: 'blur(10px)' }}>
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center gap-2">
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
          className="navbar-toggler"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-controls="navbarNav"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/blog">
                Blog
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#work">
                Work
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#faq">
                Philosophy
              </a>
            </li>
          </ul>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={onContactClick}>
              Contact
            </button>
            {api.isAuthenticated() && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  api.logout()
                  window.location.reload()
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
