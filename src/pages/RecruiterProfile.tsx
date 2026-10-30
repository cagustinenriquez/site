import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import { CyberCity } from '@/components/CyberCity'
import './blog.css'
import './admin.css'

export function RecruiterProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: recruiter, isLoading: loading, error, isError } = useQuery({
    queryKey: ['recruiter', id],
    queryFn: () => api.getRecruiter(id!),
    enabled: !!id,
  })

  if (!id) {
    return (
      <>
        <CyberCity calm />
        <main className="blog-shell admin-shell is-narrow">
          <div className="blog-error">Invalid recruiter ID</div>
        </main>
      </>
    )
  }

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell admin-shell is-narrow">
        <button onClick={() => navigate('/recruiters')} className="blog-btn rec-back">
          <ArrowLeft size={16} />
          Back to Recruiters
        </button>

        {isError && (
          <div className="blog-error">{error instanceof Error ? error.message : 'Failed to load recruiter'}</div>
        )}

        {loading && (
          <div className="blog-loading">
            Loading recruiter<span className="m0tz-dots" aria-hidden="true" />
          </div>
        )}

        {recruiter && !loading && (
          <>
            <section className="blog-glass admin-panel rec-profile-head">
              <h1 className="admin-title">{recruiter.name}</h1>
              <p className="rec-profile-company">{recruiter.company}</p>

              {recruiter.notes && (
                <div className="rec-notes">
                  <p className="admin-stat-label">Notes</p>
                  <p>{recruiter.notes}</p>
                </div>
              )}
            </section>

            <div className="rec-profile-stats">
              <div className="blog-glass admin-panel">
                <p className="admin-stat-label">Reputation</p>
                <p className={`rec-stat-value ${recruiter.reputation >= 0 ? 'is-good' : 'is-bad'}`}>
                  {recruiter.reputation >= 0 ? '+' : ''}
                  {recruiter.reputation}
                </p>
              </div>
              <div className="blog-glass admin-panel">
                <p className="admin-stat-label">Placements</p>
                <p className="rec-stat-value">{recruiter.total_placements}</p>
              </div>
              <div className="blog-glass admin-panel">
                <p className="admin-stat-label">Avg rating</p>
                <p className="rec-stat-value is-star">⭐ {recruiter.average_rating.toFixed(1)}</p>
              </div>
            </div>

            <section className="blog-glass admin-panel">
              <h2 className="admin-panel-title">Contact Information</h2>
              <dl className="rec-contact">
                {recruiter.email && (
                  <div>
                    <dt className="admin-stat-label">Email</dt>
                    <dd>
                      <a href={`mailto:${recruiter.email}`}>{recruiter.email}</a>
                    </dd>
                  </div>
                )}
                {recruiter.phone && (
                  <div>
                    <dt className="admin-stat-label">Phone</dt>
                    <dd>
                      <a href={`tel:${recruiter.phone}`}>{recruiter.phone}</a>
                    </dd>
                  </div>
                )}
                {recruiter.linkedin && (
                  <div>
                    <dt className="admin-stat-label">LinkedIn</dt>
                    <dd>
                      <a href={recruiter.linkedin} target="_blank" rel="noreferrer">
                        View Profile →
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="admin-stat-label">Company</dt>
                  <dd>{recruiter.company}</dd>
                </div>
              </dl>
            </section>
          </>
        )}
      </main>
    </>
  )
}

export default RecruiterProfile
