import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Navbar } from '@/components/Navbar'
import { BookOpen } from 'lucide-react'

export function BlogList() {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading: loading, error, isError } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => api.getPosts(page, limit),
  })

  const posts = data?.posts || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '12px',
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)', padding: '3rem 1rem', paddingTop: '6rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
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
              {error instanceof Error ? error.message : 'Failed to load posts'}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              Loading spells...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ ...glassStyle, padding: '3rem', textAlign: 'center' }}>
              <BookOpen size={48} style={{ margin: '0 auto 1rem', color: '#64748b' }} />
              <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>No posts yet.</p>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Check back soon for new spells!</p>
            </div>
          ) : (
            <>
              {/* Posts Grid */}
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
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
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'
                        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'
                        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <h3 style={{ fontWeight: '600', color: '#f1f5f9', margin: '0 0 0.75rem 0', fontSize: '1.125rem' }}>
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p style={{ color: '#cbd5e1', margin: '0 0 0.75rem 0', fontSize: '0.95rem', lineHeight: '1.5', flex: 1 }}>
                          {post.excerpt}
                        </p>
                      )}

                      {post.tags && post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                padding: '0.25rem 0.65rem',
                                background: 'rgba(14, 165, 233, 0.12)',
                                border: '1px solid rgba(14, 165, 233, 0.25)',
                                borderRadius: '14px',
                                color: '#0ea5e9',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {(post.date || post.created_at) && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                          {formatDate(post.date || post.created_at || '')}
                        </div>
                      )}
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
                    Page <span style={{ fontWeight: '600', color: '#cbd5e1' }}>{page}</span> of <span style={{ fontWeight: '600', color: '#cbd5e1' }}>{totalPages}</span>
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
    </>
  )
}

export default BlogList
