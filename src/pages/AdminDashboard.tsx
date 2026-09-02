import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Navbar } from '@/components/Navbar'
import { Trash2, Edit2, Plus, FileText } from 'lucide-react'

export function AdminDashboard() {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/blog/login')
    }
  }, [navigate])

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => api.getPosts(1, 100),
    enabled: api.isAuthenticated(),
  })

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    try {
      setDeleting(slug)
      await api.deletePost(slug)
      refetch()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post')
    } finally {
      setDeleting(null)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar showBack={true} />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)' }}>
          <div style={{ color: '#94a3b8' }}>Loading...</div>
        </div>
      </>
    )
  }

  const posts = data?.posts || []
  const totalPosts = data?.total || 0

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '12px',
  }

  return (
    <>
      <Navbar showBack={true} />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)', padding: '3rem 1rem', paddingTop: '6rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                📝 Spellbook Manager
              </h1>
              <p style={{ color: '#94a3b8' }}>Manage your grimoire of posts</p>
            </div>
            <Link to="/blog/create" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 200ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#0284c7')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0ea5e9')}
              >
                <Plus size={18} />
                New Post
              </button>
            </Link>
          </div>

          {/* Stats Card */}
          <div style={{ ...glassStyle, padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2.5rem' }}>📚</div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>TOTAL POSTS</p>
                <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#f1f5f9' }}>{totalPosts}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
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

          {/* Empty State */}
          {posts.length === 0 ? (
            <div style={{ ...glassStyle, padding: '3rem', textAlign: 'center' }}>
              <FileText size={48} style={{ margin: '0 auto 1rem', color: '#64748b' }} />
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>No posts yet. Write your first spell!</p>
              <Link to="/blog/create" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={18} />
                  Create Post
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {posts.map((post) => (
                <div
                  key={post.slug}
                  style={{
                    ...glassStyle,
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: '600', color: '#f1f5f9', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                      {post.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b', flexWrap: 'wrap' }}>
                      {post.tags && post.tags.length > 0 && (
                        <span>Tags: {post.tags.join(', ')}</span>
                      )}
                      {post.updated_at && (
                        <span>Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/blog/${post.slug}/edit`}>
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.5rem',
                          background: 'rgba(14, 165, 233, 0.1)',
                          border: '1px solid rgba(14, 165, 233, 0.3)',
                          borderRadius: '6px',
                          color: '#0ea5e9',
                          cursor: 'pointer',
                          transition: 'all 200ms',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(14, 165, 233, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)'
                        }}
                      >
                        <Edit2 size={18} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      disabled={deleting === post.slug}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.5rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        cursor: deleting === post.slug ? 'not-allowed' : 'pointer',
                        opacity: deleting === post.slug ? 0.6 : 1,
                        transition: 'all 200ms',
                      }}
                      onMouseEnter={(e) => !deleting && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
