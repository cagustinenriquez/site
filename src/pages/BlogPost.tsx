import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { api } from '@/lib/api'
import { Edit2, Trash2 } from 'lucide-react'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete post')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)' }}>
        <div style={{ color: '#94a3b8' }}>Loading...</div>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)', padding: '3rem 1rem', paddingTop: '6rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem', background: 'rgba(127, 29, 29, 0.3)', border: '1px solid #7c2d12', borderRadius: '8px', color: '#fca5a5' }}>
          {error instanceof Error ? error.message : 'Post not found'}
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const CodeBlock = ({ inline, className, children }: any) => {
    const code = String(children).replace(/\n$/, '')

    // Inline code (single backticks)
    if (inline || !className) {
      return (
        <code style={{
          background: 'rgba(14, 165, 233, 0.15)',
          padding: '0.2rem 0.4rem',
          borderRadius: '4px',
          color: '#0ea5e9',
          fontFamily: 'monospace',
          fontSize: '0.9em',
          display: 'inline',
          whiteSpace: 'nowrap',
        }}>
          {children}
        </code>
      )
    }

    // Block code (triple backticks)
    const match = /language-(\w+)/.exec(className)
    const language = match ? match[1] : 'plaintext'

    let highlightedCode = code
    try {
      highlightedCode = hljs.highlight(code, { language, ignoreIllegals: true }).value
    } catch (e) {
      highlightedCode = hljs.highlightAuto(code).value
    }

    return (
      <pre style={{ margin: '1rem 0', borderRadius: '8px', overflow: 'auto', padding: '1rem', background: '#282c34', lineHeight: '1.6', fontSize: '0.9rem' }}>
        <code
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          style={{ fontFamily: 'monospace', background: 'none' }}
        />
        <style>{`
          pre code span { background: none !important; }
        `}</style>
      </pre>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)', padding: '3rem 1rem', paddingTop: '6rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          {/* Article Card */}
          <article style={{ ...glassStyle, padding: '2.5rem', marginBottom: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '1rem', lineHeight: '1.2' }}>
                {post.title}
              </h1>

              {/* Metadata */}
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {(post.date || post.created_at) && (
                  <span>📅 {formatDate(post.date || post.created_at || '')}</span>
                )}
                {post.updated_at && (post.date || post.created_at) !== post.updated_at && (
                  <span>✏️ Updated {formatDate(post.updated_at)}</span>
                )}
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p style={{ fontSize: '1.125rem', color: '#cbd5e1', marginBottom: '1rem', fontStyle: 'italic' }}>
                  {post.excerpt}
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(14, 165, 233, 0.15)',
                        border: '1px solid rgba(14, 165, 233, 0.3)',
                        borderRadius: '16px',
                        color: '#0ea5e9',
                        fontSize: '0.825rem',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(148, 163, 184, 0.1)', margin: '2rem 0' }} />

            {/* Content */}
            <div style={{ color: '#cbd5e1', lineHeight: '1.8', marginBottom: '2rem' }}>
              <ReactMarkdown
                components={{
                  code: CodeBlock,
                  img: ({ src, alt }) => (
                    <img
                      src={src}
                      alt={alt}
                      style={{
                        maxWidth: '600px',
                        width: '100%',
                        height: 'auto',
                        margin: '1.5rem 0',
                        borderRadius: '8px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                      }}
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* End of Article Divider */}
            <div style={{ margin: '3rem 0 0', paddingTop: '2rem', borderTop: '2px solid rgba(148, 163, 184, 0.15)' }} />
          </article>

          {/* Error Message */}
          {deleteError && (
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
              {deleteError}
            </div>
          )}

          {/* Admin Actions */}
          {api.isAuthenticated() && (
            <div style={{ ...glassStyle, padding: '1.5rem', display: 'flex', gap: '1rem' }}>
              <Link to={`/blog/${post.slug}/edit`} style={{ textDecoration: 'none', flex: 1 }}>
                <button
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    borderRadius: '8px',
                    color: '#0ea5e9',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(14, 165, 233, 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)'
                  }}
                >
                  <Edit2 size={18} />
                  Edit
                </button>
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontWeight: '500',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                  transition: 'all 200ms',
                }}
                onMouseEnter={(e) => !deleting && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
              >
                <Trash2 size={18} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
  )
}

export default BlogPost
