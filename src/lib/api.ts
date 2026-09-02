const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://agustinenriquez.pythonanywhere.com'

interface LoginResponse {
  access_token: string
  token_type: string
}

interface Post {
  id: number | string
  slug: string
  title: string
  content: string
  excerpt?: string
  tags?: string[]
  date?: string
  created_at?: string
  updated_at?: string
}

interface PostsResponse {
  posts: Post[]
  total: number
  page: number
  limit: number
}

interface CreatePostPayload {
  title: string
  content: string
  excerpt?: string
  tags?: string[]
}

class ApiClient {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('access_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async login(password: string): Promise<string> {
    const data = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
    this.token = data.access_token
    localStorage.setItem('access_token', data.access_token)
    return data.access_token
  }

  logout(): void {
    this.token = null
    localStorage.removeItem('access_token')
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  async getPosts(page = 1, limit = 10, tag?: string): Promise<PostsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (tag) params.append('tag', tag)
    return this.request(`/posts?${params}`)
  }

  async getPost(slug: string): Promise<Post> {
    return this.request(`/posts/${slug}`)
  }

  async createPost(post: CreatePostPayload): Promise<Post> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    })
  }

  async updatePost(slug: string, post: CreatePostPayload): Promise<Post> {
    return this.request(`/posts/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    })
  }

  async deletePost(slug: string): Promise<void> {
    await this.request(`/posts/${slug}`, {
      method: 'DELETE',
    })
  }
}

export const api = new ApiClient()
export type { Post, PostsResponse, CreatePostPayload }
