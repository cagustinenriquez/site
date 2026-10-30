import { useState, useEffect, useRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import mermaid from 'mermaid'
import { api } from '@/lib/api'
import { calculateReadingTime } from '@/lib/utils'
import { CyberCity } from '@/components/CyberCity'
import { Edit2, Trash2 } from 'lucide-react'
import './blog.css'

mermaid.initialize({ startOnLoad: true, theme: 'dark' })

// Renders a ```mermaid block. Its own component so the effect runs on every
// render (hooks can't sit behind the `language === 'mermaid'` check).
function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      mermaid.contentLoaded()
    }
  }, [code])

  return (
    <div
      ref={ref}
      className="mermaid"
      style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'center' }}
    >
      {code}
    </div>
  )
}

// react-markdown's `code` renderer. Defined outside BlogPost so React keeps the
// same component between renders instead of remounting every code block.
type CodeBlockProps = ComponentPropsWithoutRef<'code'> & { inline?: boolean }

function CodeBlock({ inline, className, children }: CodeBlockProps) {
  const code = String(children).replace(/\n$/, '')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Inline code (single backticks)
  if (inline || !className) {
    return (
      <code className="blog-inline-code">{children}</code>
    )
  }

  // Block code (triple backticks)
  const match = /language-(\w+)/.exec(className)
  const language = match ? match[1] : 'plaintext'

  // Mermaid diagram
  if (language === 'mermaid') {
    return <MermaidDiagram code={code} />
  }

  let highlightedCode = code
  try {
    highlightedCode = hljs.highlight(code, { language, ignoreIllegals: true }).value
  } catch {
    highlightedCode = hljs.highlightAuto(code).value
  }

  return (
    <div className="blog-codeblock">
      <button className={`blog-copy${copied ? ' is-copied' : ''}`} onClick={handleCopy}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <pre style={{ margin: '0', borderRadius: '0', overflow: 'auto', padding: '1rem', background: 'none', lineHeight: '1.6', fontSize: '0.9rem' }}>
        <code
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          style={{ fontFamily: 'monospace', background: 'none' }}
        />
        <style>{`
          pre code span { background: none !important; }
        `}</style>
      </pre>
    </div>
  )
}

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
      <>
        <CyberCity calm />
        <main className="blog-shell">
          <div className="blog-loading">
            Loading<span className="m0tz-dots" aria-hidden="true" />
          </div>
        </main>
      </>
    )
  }

  if (isError || !post) {
    return (
      <>
        <CyberCity calm />
        <main className="blog-shell">
          <div className="blog-error">{error instanceof Error ? error.message : 'Post not found'}</div>
          <Link to="/blog" className="blog-btn">
            ← Back to Posts
          </Link>
        </main>
      </>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell">
        <article className="blog-article blog-glass">
          <header className="blog-post-header">
            <Link to="/blog" className="section-kicker blog-back">
              The spellbook
            </Link>
            <h1 className="blog-post-title">{post.title}</h1>

            <div className="blog-post-meta">
              {(post.date || post.created_at) && <span>{formatDate(post.date || post.created_at || '')}</span>}
              <span>{calculateReadingTime(post.content)} min read</span>
              {post.updated_at && (post.date || post.created_at) !== post.updated_at && <span>Updated {formatDate(post.updated_at)}</span>}
            </div>

            {post.excerpt && <p className="blog-post-excerpt">{post.excerpt}</p>}

            {post.tags && post.tags.length > 0 && (
              <div className="blog-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="blog-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="blog-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                  img: ({ src, alt }) => (
                    <img
                      src={src}
                      alt={alt}
                      style={{
                        width: '100%',
                        height: 'auto',
                        margin: '1.5rem 0',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                      }}
                    />
                  ),
                  table: ({ children }) => (
                    <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead style={{ background: 'rgba(45, 226, 230, 0.08)' }}>
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody>
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr style={{
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--accent)',
                      borderRight: '1px solid var(--border)',
                    }}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td style={{
                      padding: '0.75rem 1rem',
                      color: 'var(--ink-secondary)',
                      borderRight: '1px solid var(--border)',
                    }}>
                      {children}
                    </td>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
          </div>
        </article>

        {deleteError && <div className="blog-error">{deleteError}</div>}

        <div className="blog-actions blog-glass">
          <Link to="/blog" className="blog-btn">
            ← Back to Posts
          </Link>
          {api.isAuthenticated() && (
            <>
              <Link to={`/blog/${post.slug}/edit`} className="blog-btn blog-btn-accent">
                <Edit2 size={18} />
                Edit
              </Link>
              <button className="blog-btn blog-btn-danger" onClick={handleDelete} disabled={deleting}>
                <Trash2 size={18} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </main>
    </>
  )
}

export default BlogPost
