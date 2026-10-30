import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { calculateReadingTime } from '@/lib/utils'
import { useReveal, stagger } from '@/lib/useReveal'
import { CyberCity } from '@/components/CyberCity'
import { BookOpen } from 'lucide-react'
import './blog.css'

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
  useReveal([posts])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell">
        <header className="blog-header">
          <p className="section-kicker">The spellbook</p>
          <h1 className="blog-title">Blog</h1>
        </header>

        {isError && <div className="blog-error">{error instanceof Error ? error.message : 'Failed to load posts'}</div>}

        {loading ? (
          <div className="blog-loading">
            Loading spells<span className="m0tz-dots" aria-hidden="true" />
          </div>
        ) : posts.length === 0 ? (
          <div className="blog-glass blog-empty">
            <BookOpen size={48} className="blog-empty-icon" />
            <p>No posts yet.</p>
            <p className="blog-muted">Check back soon for new spells!</p>
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {posts.map((post, i) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card blog-glass reveal" style={stagger(Math.min(i, 4))}>
                  <h2 className="blog-card-title">{post.title}</h2>

                  {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}

                  {post.tags && post.tags.length > 0 && (
                    <div className="blog-tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="blog-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {(post.date || post.created_at) && (
                    <div className="blog-card-meta">
                      <span>{formatDate(post.date || post.created_at || '')}</span>
                      <span>{calculateReadingTime(post.content)} min read</span>
                    </div>
                  )}
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
                <button className="blog-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
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

export default BlogList
