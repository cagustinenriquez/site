import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Users } from 'lucide-react'

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

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '12px',
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
    setPage(1)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)', padding: '3rem 1rem', paddingTop: '6rem' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
            Recruiters
          </h1>
          <p style={{ color: '#cbd5e1', margin: 0, fontSize: '1rem' }}>
            Browse and connect with top recruiters in your industry
          </p>
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search by name or company..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '0.95rem',
              transition: 'all 200ms',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)'
              e.currentTarget.style.background = 'rgba(15, 23, 42, 1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)'
            }}
          />

          <select
            value={sortBy}
            onChange={handleSort}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '0.95rem',
              transition: 'all 200ms',
            }}
          >
            <option value="reputation">Reputation</option>
            <option value="total_placements">Most Placements</option>
            <option value="average_rating">Best Reviews</option>
          </select>
        </div>

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
            {error instanceof Error ? error.message : 'Failed to load recruiters'}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Loading recruiters...
          </div>
        ) : recruiters.length === 0 ? (
          <div style={{ ...glassStyle, padding: '3rem', textAlign: 'center' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', color: '#64748b' }} />
            <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>No recruiters found.</p>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Recruiters Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {recruiters.map((recruiter) => (
                <Link
                  key={recruiter.id}
                  to={`/recruiters/${recruiter.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      ...glassStyle,
                      padding: '1.5rem',
                      transition: 'all 200ms',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'
                      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
                      e.currentTarget.style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'
                      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Header */}
                    <h3 style={{ fontWeight: '600', color: '#f1f5f9', margin: '0 0 0.25rem 0', fontSize: '1.125rem' }}>
                      {recruiter.name}
                    </h3>
                    <p style={{ color: '#0ea5e9', margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '500' }}>
                      {recruiter.company}
                    </p>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', flex: 1 }}>
                      <div>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase', fontWeight: '600' }}>
                          Reputation
                        </p>
                        <p style={{ color: recruiter.reputation >= 0 ? '#10b981' : '#ef4444', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                          {recruiter.reputation >= 0 ? '+' : ''}{recruiter.reputation}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase', fontWeight: '600' }}>
                          Placements
                        </p>
                        <p style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                          {recruiter.total_placements}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '1rem' }}>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase', fontWeight: '600' }}>
                        Avg Rating
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#fbbf24', fontSize: '1.25rem' }}>⭐</span>
                        <span style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '1.125rem' }}>
                          {recruiter.average_rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: page === 1 ? 'rgba(148, 163, 184, 0.1)' : 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid ' + (page === 1 ? 'rgba(148, 163, 184, 0.1)' : 'rgba(14, 165, 233, 0.3)'),
                    borderRadius: '8px',
                    color: page === 1 ? '#64748b' : '#0ea5e9',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    opacity: page === 1 ? 0.5 : 1,
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={(e) => page > 1 && (e.currentTarget.style.background = 'rgba(14, 165, 233, 0.25)')}
                  onMouseLeave={(e) => page > 1 && (e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)')}
                >
                  ← Previous
                </button>

                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Page <span style={{ fontWeight: '600', color: '#cbd5e1' }}>{page}</span> of{' '}
                  <span style={{ fontWeight: '600', color: '#cbd5e1' }}>{totalPages}</span>
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: page === totalPages ? 'rgba(148, 163, 184, 0.1)' : 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid ' + (page === totalPages ? 'rgba(148, 163, 184, 0.1)' : 'rgba(14, 165, 233, 0.3)'),
                    borderRadius: '8px',
                    color: page === totalPages ? '#64748b' : '#0ea5e9',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    opacity: page === totalPages ? 0.5 : 1,
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={(e) => page < totalPages && (e.currentTarget.style.background = 'rgba(14, 165, 233, 0.25)')}
                  onMouseLeave={(e) => page < totalPages && (e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)')}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default RecruiterList
