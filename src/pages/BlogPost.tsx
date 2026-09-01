import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { api } from '@/lib/api'
import { Navbar } from '@/components/Navbar'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)

  const { data: post, isLoading: loading, error, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => api.getPost(slug!),
    enabled: !!slug,
  })

  const handleDelete = async () => {
    if (!post || !window.confirm('Are you sure you want to delete this post?')) return

    try {
      setDeleting(true)
      await api.deletePost(post.slug)
      navigate('/blog')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar showBack={true} />
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    )
  }

  if (isError || !post) {
    return (
      <>
        <Navbar showBack={true} />
        <div className="container mt-5">
          <div className="alert alert-danger" style={{ maxWidth: '48rem', margin: '0 auto' }}>
            {error instanceof Error ? error.message : 'Post not found'}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar showBack={true} />
      <div className="container mt-5 mb-5">
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <article className="card" style={{ backgroundColor: '#262626', borderColor: '#404040' }}>
            <div className="card-body">
              <h1 className="card-title display-5 mb-3">{post.title}</h1>
              {post.excerpt && <p className="lead" style={{ color: '#c9c9c9' }}>{post.excerpt}</p>}

              {post.tags && post.tags.length > 0 && (
                <div className="mt-4 mb-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="badge bg-secondary me-2 mb-2">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <hr style={{ borderColor: '#404040' }} />

              <div className="mt-4 prose prose-invert max-w-none" style={{ color: '#c9c9c9', lineHeight: '1.6' }}>
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              {post.updated_at && (
                <div className="mt-4 text-muted-foreground" style={{ color: '#888888', fontSize: '0.875rem' }}>
                  Last updated: {new Date(post.updated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </article>

          {api.isAuthenticated() && (
            <div className="mt-4 d-flex gap-2">
              <a href={`/blog/${post.slug}/edit`} className="btn btn-primary">
                Edit Post
              </a>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default BlogPost
