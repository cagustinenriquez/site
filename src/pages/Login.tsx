import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '@/lib/api'
import { CyberCity } from '@/components/CyberCity'
import { M0tz } from '@/components/M0tz'
import './blog.css'
import './admin.css'

interface LoginState {
  from?: { pathname: string }
  message?: string
}

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const state = location.state as LoginState | null
  // e.g. "Session expired" when redirected here after the API rejected our tokens
  const [error, setError] = useState<string | null>(state?.message ?? null)

  const from = state?.from?.pathname || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError('Username and password are required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await api.login(username, password)
      navigate(from)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell admin-shell is-login">
        <header className="admin-login-head">
          <M0tz size={56} />
          <p className="section-kicker">Technovoodoo admin access</p>
          <h1 className="admin-title">Enter the Spellbook</h1>
        </header>

        <div className="blog-glass admin-panel">
          <form onSubmit={handleSubmit} className="admin-form">
            {error && <div className="blog-error">{error}</div>}

            <div>
              <label htmlFor="username" className="admin-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="admin-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Sorcerer name"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="admin-label">
                Incantation Password
              </label>
              <input
                id="password"
                type="password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading} className="blog-btn blog-btn-primary blog-btn-block">
              {loading ? 'Casting spell...' : 'Unlock the Spellbook'}
            </button>
          </form>
        </div>

        <p className="admin-login-foot">Only the chosen few can access the technovoodoo grimoire.</p>
      </main>
    </>
  )
}

export default Login
