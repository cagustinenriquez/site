import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Trash2, Edit2, Plus, FileText, BookOpen, Users } from 'lucide-react'
import { CyberCity } from '@/components/CyberCity'
import './blog.css'
import './admin.css'

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

  // Only the total is needed, so ask for a single row
  const { data: recruiterData } = useQuery({
    queryKey: ['admin-recruiter-total'],
    queryFn: () => api.getRecruiters(1, 1),
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
        <CyberCity calm />
        <main className="blog-shell admin-shell">
          <div className="blog-loading">
            Loading<span className="m0tz-dots" aria-hidden="true" />
          </div>
        </main>
      </>
    )
  }

  const posts = data?.posts || []
  const totalPosts = data?.total || 0

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell admin-shell">
        <header className="admin-header">
          <div>
            <p className="section-kicker">Admin</p>
            <h1 className="admin-title">Spellbook Manager</h1>
            <p className="admin-subtitle">Manage your grimoire of posts</p>
          </div>
          <div className="admin-header-actions">
            <Link to="/blog/create" className="blog-btn blog-btn-primary">
              <Plus size={18} />
              New Post
            </Link>
            <Link to="/admin/recruiters?new=1" className="blog-btn blog-btn-primary">
              <Plus size={18} />
              Add Recruiter
            </Link>
          </div>
        </header>

        <div className="admin-stats">
          <Link to="/blog" className="blog-glass admin-panel admin-stat is-link">
            <div className="admin-stat-icon" aria-hidden="true">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="admin-stat-label">Total posts</p>
              <p className="admin-stat-value">{totalPosts}</p>
            </div>
          </Link>
          <Link to="/recruiters" className="blog-glass admin-panel admin-stat is-link">
            <div className="admin-stat-icon" aria-hidden="true">
              <Users size={24} />
            </div>
            <div>
              <p className="admin-stat-label">Total recruiters</p>
              <p className="admin-stat-value">{recruiterData ? recruiterData.total : '–'}</p>
            </div>
          </Link>
        </div>

        {isError && <div className="blog-error">{error instanceof Error ? error.message : 'Failed to load posts'}</div>}

        {posts.length === 0 ? (
          <div className="blog-glass blog-empty">
            <FileText size={48} className="blog-empty-icon" />
            <p>No posts yet. Write your first spell!</p>
            <Link to="/blog/create" className="blog-btn blog-btn-primary">
              <Plus size={18} />
              Create Post
            </Link>
          </div>
        ) : (
          <div className="admin-list">
            {posts.map((post) => (
              <div key={post.slug} className="blog-glass admin-row">
                <div className="admin-row-main">
                  <h3 className="admin-row-title">{post.title}</h3>
                  <div className="admin-row-meta">
                    {post.tags && post.tags.length > 0 && (
                      <div className="blog-tags">
                        {post.tags.map((tag) => (
                          <span key={tag} className="blog-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {post.updated_at && <span>Updated {new Date(post.updated_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="admin-actions">
                  <Link
                    to={`/blog/${post.slug}/edit`}
                    className="blog-btn blog-btn-accent admin-icon-btn"
                    aria-label={`Edit ${post.title}`}
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    disabled={deleting === post.slug}
                    className="blog-btn blog-btn-danger admin-icon-btn"
                    aria-label={`Delete ${post.title}`}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default AdminDashboard
