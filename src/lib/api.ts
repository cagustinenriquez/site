const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://agustinenriquez.pythonanywhere.com'

interface LoginResponse {
  access_token: string
  refresh_token: string
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

interface Recruiter {
  id: number | string
  name: string
  company: string
  email: string
  phone?: string
  linkedin?: string
  notes?: string
  reputation: number
  total_placements: number
  average_rating: number
  created_at?: string
  updated_at?: string
}

interface RecruitersResponse {
  recruiters: Recruiter[]
  total: number
  page: number
  limit: number
}

interface CreateRecruiterPayload {
  name: string
  company: string
  email: string
  phone?: string
  linkedin?: string
  notes?: string
  reputation?: number
}

interface UpdateRecruiterPayload {
  name?: string
  company?: string
  email?: string
  phone?: string
  linkedin?: string
  notes?: string
  reputation?: number
  total_placements?: number
  average_rating?: number
}

interface RecruiterComment {
  id: string
  recruiter_id: string
  author: string
  body: string
  created_at: string
}

const INTERVIEW_TYPES = ['coding', 'system_design', 'behavioral', 'take_home', 'pair_programming', 'other'] as const
type InterviewType = (typeof INTERVIEW_TYPES)[number]

const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  coding: 'Coding',
  system_design: 'System design',
  behavioral: 'Behavioral',
  take_home: 'Take-home',
  pair_programming: 'Pair programming',
  other: 'Other',
}

interface Interviewer {
  id: number | string
  name: string
  company: string
  role?: string
  email?: string
  linkedin?: string
  interview_types: InterviewType[]
  rating: number
  notes?: string
  created_at?: string
  updated_at?: string
}

interface InterviewersResponse {
  interviewers: Interviewer[]
  total: number
  page: number
  limit: number
}

interface CreateInterviewerPayload {
  name: string
  company: string
  role?: string
  email?: string
  linkedin?: string
  interview_types?: InterviewType[]
  rating?: number
  notes?: string
}

type UpdateInterviewerPayload = Partial<CreateInterviewerPayload>

interface InterviewerComment {
  id: string
  interviewer_id: string
  author: string
  body: string
  created_at: string
}

/** Error from the API, with the HTTP status so callers can tell a 404 apart */
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const SESSION_EXPIRED_MESSAGE = 'Session expired. Please log in again.'

// Older builds could store the string "undefined" when the API sent no token
function readStored(key: string): string | null {
  const value = localStorage.getItem(key)
  return value && value !== 'undefined' && value !== 'null' ? value : null
}

class ApiClient {
  private token: string | null = null
  private refreshToken: string | null = null
  private sessionExpiredHandler: (() => void) | null = null

  constructor() {
    this.token = readStored('access_token')
    this.refreshToken = readStored('refresh_token')
  }

  private setTokens(access: string, refresh?: string): void {
    this.token = access
    localStorage.setItem('access_token', access)
    if (refresh) {
      this.refreshToken = refresh
      localStorage.setItem('refresh_token', refresh)
    }
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

    let response = await fetch(url, {
      ...options,
      headers,
    })

    // If 401, try to refresh token and retry. Never for /auth/* calls: a wrong
    // password should say so, and a failed refresh must not refresh again.
    if (response.status === 401 && this.refreshToken && !endpoint.startsWith('/auth/')) {
      try {
        await this.refreshAccessToken()
        headers['Authorization'] = `Bearer ${this.token}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      } catch {
        this.logout()
        this.sessionExpiredHandler?.()
        throw new Error(SESSION_EXPIRED_MESSAGE)
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      // FastAPI errors use `detail`; rate-limit (429) errors use `error`
      const message =
        (typeof error.detail === 'string' && error.detail) ||
        (typeof error.error === 'string' && error.error) ||
        (response.status === 429 ? 'Too many requests. Please wait a minute and try again.' : '') ||
        `HTTP ${response.status}`
      throw new ApiError(message, response.status)
    }

    return response.json()
  }

  async login(username: string, password: string): Promise<string> {
    const data = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    this.setTokens(data.access_token, data.refresh_token)
    return data.access_token
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const data = await this.request<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    })
    // The backend rotates the refresh token on every refresh
    this.setTokens(data.access_token, data.refresh_token)
    return data.access_token
  }

  logout(): void {
    this.token = null
    this.refreshToken = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  /** Called when the refresh token is rejected, e.g. the user no longer exists */
  onSessionExpired(handler: (() => void) | null): void {
    this.sessionExpiredHandler = handler
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
    return this.request(`/posts/${encodeURIComponent(slug)}`)
  }

  async createPost(post: CreatePostPayload): Promise<Post> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    })
  }

  async updatePost(slug: string, post: CreatePostPayload): Promise<Post> {
    return this.request(`/posts/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    })
  }

  async deletePost(slug: string): Promise<void> {
    await this.request(`/posts/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    })
  }

  async getRecruiters(page = 1, limit = 10, sort?: string, search?: string): Promise<RecruitersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (sort) params.append('sort', sort)
    if (search) params.append('search', search)
    return this.request(`/recruiters?${params}`)
  }

  async getRecruiter(id: number | string): Promise<Recruiter> {
    return this.request(`/recruiters/${id}`)
  }

  async createRecruiter(recruiter: CreateRecruiterPayload): Promise<Recruiter> {
    return this.request('/recruiters', {
      method: 'POST',
      body: JSON.stringify(recruiter),
    })
  }

  async updateRecruiter(id: number | string, recruiter: UpdateRecruiterPayload): Promise<Recruiter> {
    return this.request(`/recruiters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recruiter),
    })
  }

  async deleteRecruiter(id: number | string): Promise<void> {
    await this.request(`/recruiters/${id}`, {
      method: 'DELETE',
    })
  }

  async getRecruiterComments(recruiterId: number | string): Promise<RecruiterComment[]> {
    return this.request(`/recruiters/${recruiterId}/comments`)
  }

  async addRecruiterComment(recruiterId: number | string, body: string): Promise<RecruiterComment> {
    return this.request(`/recruiters/${recruiterId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
  }

  async deleteRecruiterComment(recruiterId: number | string, commentId: string): Promise<void> {
    await this.request(`/recruiters/${recruiterId}/comments/${commentId}`, {
      method: 'DELETE',
    })
  }

  async getInterviewers(
    page = 1,
    limit = 10,
    sort?: string,
    search?: string,
    type?: InterviewType
  ): Promise<InterviewersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (sort) params.append('sort', sort)
    if (search) params.append('search', search)
    if (type) params.append('type', type)
    return this.request(`/interviewers?${params}`)
  }

  async getInterviewer(id: number | string): Promise<Interviewer> {
    return this.request(`/interviewers/${id}`)
  }

  async createInterviewer(interviewer: CreateInterviewerPayload): Promise<Interviewer> {
    return this.request('/interviewers', {
      method: 'POST',
      body: JSON.stringify(interviewer),
    })
  }

  async updateInterviewer(id: number | string, interviewer: UpdateInterviewerPayload): Promise<Interviewer> {
    return this.request(`/interviewers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(interviewer),
    })
  }

  async deleteInterviewer(id: number | string): Promise<void> {
    await this.request(`/interviewers/${id}`, {
      method: 'DELETE',
    })
  }

  async getInterviewerComments(interviewerId: number | string): Promise<InterviewerComment[]> {
    return this.request(`/interviewers/${interviewerId}/comments`)
  }

  async addInterviewerComment(interviewerId: number | string, body: string): Promise<InterviewerComment> {
    return this.request(`/interviewers/${interviewerId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
  }

  async deleteInterviewerComment(interviewerId: number | string, commentId: string): Promise<void> {
    await this.request(`/interviewers/${interviewerId}/comments/${commentId}`, {
      method: 'DELETE',
    })
  }
}

export const api = new ApiClient()
export { INTERVIEW_TYPES, INTERVIEW_TYPE_LABELS }
export type {
  Post,
  PostsResponse,
  CreatePostPayload,
  Recruiter,
  RecruitersResponse,
  CreateRecruiterPayload,
  UpdateRecruiterPayload,
  RecruiterComment,
  InterviewType,
  Interviewer,
  InterviewersResponse,
  CreateInterviewerPayload,
  UpdateInterviewerPayload,
  InterviewerComment,
}
