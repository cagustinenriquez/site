import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '@/lib/api'
import { Navbar } from '@/components/Navbar'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as any)?.from?.pathname || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      setError('Password is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await api.login(password)
      navigate(from)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 pt-24">
        <div style={{ maxWidth: '28rem', width: '100%' }}>
          <div className="text-center mb-8">
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔐</p>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '0.5rem' }}>
              Enter the Spellbook
            </h1>
            <p style={{ color: '#cbd5e1' }}>Technovoodoo admin access</p>
          </div>

          <div
            style={{
              border: '1px solid #404040',
              borderRadius: '12px',
              padding: '2rem',
              backgroundColor: 'rgba(38, 38, 38, 0.5)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {error && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(127, 29, 29, 0.3)',
                  border: '1px solid #7c2d12',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  fontSize: '0.875rem',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#cbd5e1',
                    marginBottom: '0.5rem',
                  }}
                >
                  Incantation Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    transition: 'border-color 200ms',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#0ea5e9')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#404040')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0ea5e9',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '500',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background-color 200ms',
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0284c7')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0ea5e9')}
              >
                {loading ? 'Casting spell...' : 'Unlock the Spellbook'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', marginTop: '1.5rem' }}>
            Only the chosen few can access the technovoodoo grimoire.
          </p>
        </div>
      </div>
    </>
  )
}

export default Login
