import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api, INTERVIEW_TYPES, INTERVIEW_TYPE_LABELS, type InterviewType } from '@/lib/api'
import { Code2, Plus } from 'lucide-react'
import { CyberCity } from '@/components/CyberCity'
import './blog.css'
import './admin.css'

export function InterviewerList() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [typeFilter, setTypeFilter] = useState<InterviewType | ''>('')
  const limit = 12

  const { data, isLoading: loading, error, isError } = useQuery({
    queryKey: ['interviewers', page, searchTerm, sortBy, typeFilter],
    queryFn: () => api.getInterviewers(page, limit, sortBy, searchTerm || undefined, typeFilter || undefined),
  })

  const interviewers = data?.interviewers || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell admin-shell">
        <header className="admin-header">
          <div>
            <p className="section-kicker">Field notes</p>
            <h1 className="admin-title">Technical Interviewers</h1>
            <p className="admin-subtitle">Engineers and managers who ran the technical rounds</p>
          </div>
          <Link to="/admin/interviewers?new=1" className="blog-btn blog-btn-primary">
            <Plus size={18} />
            Add Interviewer
          </Link>
        </header>

        <div className="rec-filters int-filters">
          <input
            type="search"
            className="admin-input"
            placeholder="Search by name, company or role..."
            aria-label="Search interviewers"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
          />
          <select
            className="admin-input"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as InterviewType | '')
              setPage(1)
            }}
            aria-label="Filter by interview type"
          >
            <option value="">All interview types</option>
            {INTERVIEW_TYPES.map((t) => (
              <option key={t} value={t}>
                {INTERVIEW_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            className="admin-input"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            aria-label="Sort interviewers"
          >
            <option value="rating">Best rated</option>
            <option value="name">Name</option>
            <option value="created_at">Recently added</option>
          </select>
        </div>

        {isError && (
          <div className="blog-error">{error instanceof Error ? error.message : 'Failed to load interviewers'}</div>
        )}

        {loading ? (
          <div className="blog-loading">
            Loading interviewers<span className="m0tz-dots" aria-hidden="true" />
          </div>
        ) : interviewers.length === 0 ? (
          !isError && (
            <div className="blog-glass blog-empty">
              <Code2 size={48} className="blog-empty-icon" />
              <p>No interviewers found.</p>
              <p className="blog-muted">Try adjusting your search or filters</p>
            </div>
          )
        ) : (
          <>
            <div className="rec-grid">
              {interviewers.map((interviewer) => (
                <Link
                  key={interviewer.id}
                  to={`/interviewers/${interviewer.id}`}
                  className="blog-card blog-glass rec-card"
                >
                  <h3 className="blog-card-title">{interviewer.name}</h3>
                  <p className="rec-company">
                    {interviewer.role ? `${interviewer.role} · ` : ''}
                    {interviewer.company}
                  </p>

                  {interviewer.interview_types.length > 0 && (
                    <div className="blog-tags int-types">
                      {interviewer.interview_types.map((t) => (
                        <span key={t} className="blog-tag">
                          {INTERVIEW_TYPE_LABELS[t] ?? t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="blog-card-meta">
                    <span>Rating</span>
                    <span className="rec-rating">⭐ {interviewer.rating.toFixed(1)}</span>
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

export default InterviewerList
