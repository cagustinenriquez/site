import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'

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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)', padding: '3rem 1rem', paddingTop: '6rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', color: '#94a3b8' }}>
          Invalid recruiter ID
        </div>
      </div>
    )
  }

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '12px',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)', padding: '3rem 1rem', paddingTop: '6rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/recruiters')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            marginBottom: '2rem',
            background: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '8px',
            color: '#0ea5e9',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
          }}
        >
          <ArrowLeft size={16} />
          Back to Recruiters
        </button>

        {/* Error */}
        {isError && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(127, 29, 29, 0.3)',
              border: '1px solid #7c2d12',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.875rem',
            }}
          >
            {error instanceof Error ? error.message : 'Failed to load recruiter'}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Loading recruiter...
          </div>
        )}

        {/* Profile */}
        {recruiter && !loading && (
          <>
            {/* Header Card */}
            <div style={{ ...glassStyle, padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                  {recruiter.name}
                </h1>
                <p style={{ color: '#0ea5e9', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                  {recruiter.company}
                </p>
                {recruiter.email && (
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.5rem 0 0 0' }}>
                    {recruiter.email}
                  </p>
                )}
              </div>

              {recruiter.notes && (
                <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontWeight: '600' }}>
                    Notes
                  </p>
                  <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                    {recruiter.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Reputation */}
              <div style={{ ...glassStyle, padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Reputation
                </p>
                <p style={{ color: recruiter.reputation >= 0 ? '#10b981' : '#ef4444', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
                  {recruiter.reputation >= 0 ? '+' : ''}{recruiter.reputation}
                </p>
              </div>

              {/* Total Placements */}
              <div style={{ ...glassStyle, padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Total Placements
                </p>
                <p style={{ color: '#f1f5f9', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
                  {recruiter.total_placements}
                </p>
              </div>

              {/* Average Rating */}
              <div style={{ ...glassStyle, padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Average Rating
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>⭐</span>
                  <p style={{ color: '#f1f5f9', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
                    {recruiter.average_rating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div style={{ ...glassStyle, padding: '1.5rem' }}>
              <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
                Contact Information
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                    Email
                  </p>
                  <a
                    href={`mailto:${recruiter.email}`}
                    style={{
                      color: '#0ea5e9',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                    }}
                  >
                    {recruiter.email}
                  </a>
                </div>
                {recruiter.phone && (
                  <div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                      Phone
                    </p>
                    <a
                      href={`tel:${recruiter.phone}`}
                      style={{
                        color: '#0ea5e9',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                      }}
                    >
                      {recruiter.phone}
                    </a>
                  </div>
                )}
                {recruiter.linkedin && (
                  <div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                      LinkedIn
                    </p>
                    <a
                      href={recruiter.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#0ea5e9',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                      }}
                    >
                      View Profile →
                    </a>
                  </div>
                )}
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                    Company
                  </p>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0 }}>
                    {recruiter.company}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default RecruiterProfile
