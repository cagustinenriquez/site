import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api, type Post } from '@/lib/api'
import { Navbar } from '@/components/Navbar'
import { ArrowLeft } from 'lucide-react'

export function BlogEditor() {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(!!slug)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState('')

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/blog/login')
      return
    }

    if (slug) {
      async function loadPost() {
        try {
          setLoading(true)
          const post = await api.getPost(slug!)
          setTitle(post.title)
          setContent(post.content)
          setExcerpt(post.excerpt || '')
          setTags(post.tags?.join(', ') || '')
          setError(null)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load post')
        } finally {
          setLoading(false)
        }
      }

      loadPost()
    }
  }, [slug, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    try {
      setSaving(true)
      const postData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }

      let savedPost: Post
      if (slug) {
        savedPost = await api.updatePost(slug, postData)
      } else {
        savedPost = await api.createPost(postData)
      }

      navigate(`/blog/${savedPost.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)' }}>
          <div style={{ color: '#94a3b8' }}>Loading...</div>
        </div>
      </>
    )
  }

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '12px',
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '1rem',
    fontFamily: 'inherit',
    transition: 'border-color 200ms',
    boxSizing: 'border-box' as const,
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)', padding: '3rem 1rem', paddingTop: '6rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          {/* Back Button */}
          <Link to="/admin" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(148, 163, 184, 0.1)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'
                e.currentTarget.style.color = '#cbd5e1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'
                e.currentTarget.style.color = '#94a3b8'
              }}
            >
              <ArrowLeft size={16} />
              Back to Admin
            </button>
          </Link>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '0.5rem' }}>
              {slug ? '✏️ Edit Post' : '📝 New Post'}
            </h1>
            <p style={{ color: '#94a3b8' }}>Write your spell and share it with the world</p>
          </div>

          {/* Form Card */}
          <div style={{ ...glassStyle, padding: '2rem' }}>
            {error && (
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
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your spell a name"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)')}
                />
              </div>

              {/* Excerpt */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Excerpt (optional)
                </label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief preview of your post"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)')}
                />
              </div>

              {/* Content */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Content (Markdown supported)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here... Use markdown for formatting and ![alt](url) for images"
                  rows={16}
                  required
                  style={{
                    ...inputStyle,
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)')}
                />
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Tags (comma-separated, optional)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="python, fastapi, backend"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)')}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    transition: 'background 200ms',
                  }}
                  onMouseEnter={(e) => !saving && (e.currentTarget.style.background = '#0284c7')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#0ea5e9')}
                >
                  {saving ? 'Casting spell...' : 'Cast Spell'}
                </button>

                <Link to="/admin" style={{ textDecoration: 'none' }}>
                  <button
                    type="button"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(148, 163, 184, 0.1)',
                      color: '#cbd5e1',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 200ms',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'
                    }}
                  >
                    Cancel
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default BlogEditor
