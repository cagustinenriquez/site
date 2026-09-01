import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api, type Post } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/Navbar'
import { Loader, ArrowLeft } from 'lucide-react'

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
        <div className="flex items-center justify-center min-h-screen bg-neutral-900">
          <Loader className="animate-spin text-slate-600" />
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-900 py-12 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <Link to="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to posts
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">{slug ? 'Edit Post' : 'Create New Post'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  required
                />
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-slate-300 mb-2">
                  Excerpt (optional)
                </label>
                <Input
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief preview of your post"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">
                  Content
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  rows={12}
                  required
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-slate-300 mb-2">
                  Tags (comma-separated, optional)
                </label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="python, fastapi, backend"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Post'}
                </Button>
                <Link to="/blog">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  )
}

export default BlogEditor
