import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Users } from 'lucide-react'
import { CyberCity } from '@/components/CyberCity'
import './blog.css'
import './admin.css'

export function RecruiterList() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('reputation')
  const limit = 12

  const { data, isLoading: loading, error, isError } = useQuery({
    queryKey: ['recruiters', page, searchTerm, sortBy],
    queryFn: () => api.getRecruiters(page, limit, sortBy, searchTerm || undefined),
  })

  const recruiters = data?.recruiters || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
    setPage(1)
  }

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell admin-shell">
        <header>
          <p className="section-kicker">Field notes</p>
          <h1 className="admin-title">Recruiters</h1>
          <p className="admin-subtitle">Browse and connect with top recruiters in your industry</p>
        </header>

        <div className="rec-filters">
          <input
            type="search"
            className="admin-input"
            placeholder="Search by name or company..."
            aria-label="Search recruiters"
            value={searchTerm}
            onChange={handleSearch}
          />
          <select className="admin-input" value={sortBy} onChange={handleSort} aria-label="Sort recruiters">
            <option value="reputation">Reputation</option>
            <option value="total_placements">Most Placements</option>
            <option value="average_rating">Best Reviews</option>
          </select>
        </div>

        {isError && (
          <div className="blog-error">{error instanceof Error ? error.message : 'Failed to load recruiters'}</div>
        )}

        {loading ? (
          <div className="blog-loading">
            Loading recruiters<span className="m0tz-dots" aria-hidden="true" />
          </div>
        ) : recruiters.length === 0 ? (
          <div className="blog-glass blog-empty">
            <Users size={48} className="blog-empty-icon" />
            <p>No recruiters found.</p>
            <p className="blog-muted">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="rec-grid">
              {recruiters.map((recruiter) => (
                <Link key={recruiter.id} to={`/recruiters/${recruiter.id}`} className="blog-card blog-glass rec-card">
                  <h3 className="blog-card-title">{recruiter.name}</h3>
                  <p className="rec-company">{recruiter.company}</p>

                  <div className="rec-stats">
                    <div>
                      <p className="admin-stat-label">Reputation</p>
                      <p className={`rec-stat-value ${recruiter.reputation >= 0 ? 'is-good' : 'is-bad'}`}>
                        {recruiter.reputation >= 0 ? '+' : ''}
                        {recruiter.reputation}
                      </p>
                    </div>
                    <div>
                      <p className="admin-stat-label">Placements</p>
                      <p className="rec-stat-value">{recruiter.total_placements}</p>
                    </div>
                  </div>

                  <div className="blog-card-meta">
                    <span>Avg rating</span>
                    <span className="rec-rating">
                      ⭐ {recruiter.average_rating.toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="blog-pager" aria-label="Pages">
                <button className="blog-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  ← Previous
                </button>
                <span className="blog-muted">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                  className="blog-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </>
  )
}

export default RecruiterList
