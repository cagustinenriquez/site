import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Edit2, Plus } from 'lucide-react'

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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-slate-400">Loading...</div>
        </div>
      </>
    )
  }

  const posts = data?.posts || []
  const totalPosts = data?.total || 0

  return (
    <>
      <Navbar showBack={true} />
      <div className="min-h-screen bg-neutral-900 py-12 px-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-slate-400">Manage your blog posts</p>
              </div>
              <Link to="/blog/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalPosts}</div>
              </CardContent>
            </Card>
          </div>

          {isError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
              {error instanceof Error ? error.message : 'Failed to load posts'}
            </div>
          )}

          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-400 mb-4">No posts yet. Create your first one!</p>
                <Link to="/blog/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card key={post.slug} className="hover:border-slate-600 transition">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{post.title}</h3>
                        <div className="flex gap-3 text-sm text-slate-400">
                          {post.tags && post.tags.length > 0 && (
                            <span>{post.tags.join(', ')}</span>
                          )}
                          {post.updated_at && (
                            <span>
                              Updated: {new Date(post.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/blog/${post.slug}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(post.slug)}
                          disabled={deleting === post.slug}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
