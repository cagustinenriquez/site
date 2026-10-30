import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api, type Post } from '@/lib/api'
import { CyberCity } from '@/components/CyberCity'
import './blog.css'
import './admin.css'

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
        <CyberCity calm />
        <main className="blog-shell admin-shell is-narrow">
          <div className="blog-loading">
            Loading<span className="m0tz-dots" aria-hidden="true" />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell admin-shell is-narrow">
        <header>
          <Link to="/admin" className="section-kicker blog-back">
            Back to Admin
          </Link>
          <h1 className="admin-title">{slug ? 'Edit Post' : 'New Post'}</h1>
          <p className="admin-subtitle">Write your spell and share it with the world</p>
        </header>

        <div className="blog-glass admin-panel">
          <form onSubmit={handleSubmit} className="admin-form">
            {error && <div className="blog-error">{error}</div>}

            <div>
              <label htmlFor="post-title" className="admin-label">
                Title
              </label>
              <input
                id="post-title"
                type="text"
                className="admin-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your spell a name"
                required
              />
            </div>

            <div>
              <label htmlFor="post-excerpt" className="admin-label">
                Excerpt (optional)
              </label>
              <input
                id="post-excerpt"
                type="text"
                className="admin-input"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief preview of your post"
              />
            </div>

            <div>
              <label htmlFor="post-content" className="admin-label">
                Content (Markdown supported)
              </label>
              <textarea
                id="post-content"
                className="admin-input is-code"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here... Use markdown for formatting and ![alt](url) for images"
                rows={16}
                required
              />
            </div>

            <div>
              <label htmlFor="post-tags" className="admin-label">
                Tags (comma-separated, optional)
              </label>
              <input
                id="post-tags"
                type="text"
                className="admin-input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="python, fastapi, backend"
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" disabled={saving} className="blog-btn blog-btn-primary">
                {saving ? 'Casting spell...' : 'Cast Spell'}
              </button>
              <Link to="/admin" className="blog-btn">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default BlogEditor
