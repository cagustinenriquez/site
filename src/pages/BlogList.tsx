import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Navbar } from '@/components/Navbar'

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

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        {isError && (
          <div className="alert alert-danger mx-auto" style={{ maxWidth: '48rem' }}>
            {error instanceof Error ? error.message : 'Failed to load posts'}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="alert alert-secondary mx-auto" style={{ maxWidth: '48rem' }}>
            No posts yet. Check back soon!
          </div>
        ) : (
          <>
            <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="text-decoration-none mb-4 d-block"
                >
                  <div className="card h-100" style={{ backgroundColor: '#262626', borderColor: '#404040' }}>
                    <div className="card-body">
                      <h5 className="card-title">{post.title}</h5>
                      {post.excerpt && <p className="card-text" style={{ color: '#c9c9c9' }}>{post.excerpt}</p>}
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-3">
                          {post.tags.map((tag) => (
                            <span key={tag} className="badge bg-secondary me-2 mb-2">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="d-flex justify-content-center gap-3 mt-5 mb-5">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default BlogList
