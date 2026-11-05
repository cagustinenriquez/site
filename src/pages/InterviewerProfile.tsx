import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api, INTERVIEW_TYPE_LABELS } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import { CyberCity } from '@/components/CyberCity'
import { InterviewerComments } from '@/components/RecruiterComments'
import './blog.css'
import './admin.css'

export function InterviewerProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: interviewer, isLoading: loading, error, isError } = useQuery({
    queryKey: ['interviewer', id],
    queryFn: () => api.getInterviewer(id!),
    enabled: !!id,
  })

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell admin-shell is-narrow">
        <button onClick={() => navigate('/interviewers')} className="blog-btn rec-back">
          <ArrowLeft size={16} />
          Back to Interviewers
        </button>

        {isError && (
          <div className="blog-error">{error instanceof Error ? error.message : 'Failed to load interviewer'}</div>
        )}

        {loading && (
          <div className="blog-loading">
            Loading interviewer<span className="m0tz-dots" aria-hidden="true" />
          </div>
        )}

        {interviewer && !loading && (
          <>
            <section className="blog-glass admin-panel rec-profile-head">
              <h1 className="admin-title">{interviewer.name}</h1>
              <p className="rec-profile-company">
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

              {interviewer.notes && (
                <div className="rec-notes">
                  <p className="admin-stat-label">Notes</p>
                  <p>{interviewer.notes}</p>
                </div>
              )}
            </section>

            <div className="rec-profile-stats int-profile-stats">
              <div className="blog-glass admin-panel">
                <p className="admin-stat-label">Rating</p>
                <p className="rec-stat-value is-star">⭐ {interviewer.rating.toFixed(1)}</p>
              </div>
            </div>

            {(interviewer.email || interviewer.linkedin) && (
              <section className="blog-glass admin-panel">
                <h2 className="admin-panel-title">Contact Information</h2>
                <dl className="rec-contact">
                  {interviewer.email && (
                    <div>
                      <dt className="admin-stat-label">Email</dt>
                      <dd>
                        <a href={`mailto:${interviewer.email}`}>{interviewer.email}</a>
                      </dd>
                    </div>
                  )}
                  {interviewer.linkedin && (
                    <div>
                      <dt className="admin-stat-label">LinkedIn</dt>
                      <dd>
                        <a href={interviewer.linkedin} target="_blank" rel="noreferrer">
                          View Profile →
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            <InterviewerComments interviewerId={String(interviewer.id)} />
          </>
        )}
      </main>
    </>
  )
}

export default InterviewerProfile
