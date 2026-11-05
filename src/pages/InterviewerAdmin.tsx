import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  api,
  INTERVIEW_TYPES,
  INTERVIEW_TYPE_LABELS,
  type CreateInterviewerPayload,
  type Interviewer,
  type InterviewType,
} from '@/lib/api'
import { Trash2, Edit2, Plus } from 'lucide-react'
import { CyberCity } from '@/components/CyberCity'
import './blog.css'
import './admin.css'

const EMPTY_FORM = {
  name: '',
  company: '',
  role: '',
  email: '',
  linkedin: '',
  notes: '',
  interview_types: [] as InterviewType[],
  // Kept as typed text so partial input like "4." isn't cut off; converted on save
  rating: '0',
}

export function InterviewerAdmin() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const limit = 20
  // ?new=1 (from the "Add Interviewer" links) opens the form right away
  const [searchParams] = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('new') === '1')
  const [editingId, setEditingId] = useState<number | string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data, isLoading: loading, isError, error } = useQuery({
    queryKey: ['interviewers-admin', page],
    queryFn: () => api.getInterviewers(page, limit),
  })

  const interviewers = data?.interviewers || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['interviewers-admin'] })
    queryClient.invalidateQueries({ queryKey: ['interviewers'] })
    queryClient.invalidateQueries({ queryKey: ['interviewer'] })
  }

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | string | null; payload: CreateInterviewerPayload }) =>
      id ? api.updateInterviewer(id, payload) : api.createInterviewer(payload),
    onSuccess: () => {
      invalidate()
      resetForm()
      setIsFormOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => api.deleteInterviewer(id),
    onSuccess: invalidate,
  })

  const handleEdit = (interviewer: Interviewer) => {
    setForm({
      name: interviewer.name,
      company: interviewer.company,
      role: interviewer.role || '',
      email: interviewer.email || '',
      linkedin: interviewer.linkedin || '',
      notes: interviewer.notes || '',
      interview_types: interviewer.interview_types,
      rating: String(interviewer.rating),
    })
    setEditingId(interviewer.id)
    setIsFormOpen(true)
  }

  const toggleType = (type: InterviewType) => {
    setForm((f) => ({
      ...f,
      interview_types: f.interview_types.includes(type)
        ? f.interview_types.filter((t) => t !== type)
        : [...f.interview_types, type],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const rating = Math.min(5, Math.max(0, parseFloat(form.rating) || 0))
    saveMutation.mutate({ id: editingId, payload: { ...form, rating } })
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    saveMutation.reset()
  }

  const field = (key: 'name' | 'company' | 'role' | 'email' | 'linkedin' | 'notes') => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  })

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell admin-shell">
        <header className="admin-header">
          <div>
            <p className="section-kicker">Admin</p>
            <h1 className="admin-title">Interviewer Admin</h1>
            <p className="admin-subtitle">Manage technical interviewers and how their rounds went</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setIsFormOpen(!isFormOpen)
            }}
            className="blog-btn blog-btn-primary"
          >
            <Plus size={18} />
            Add Interviewer
          </button>
        </header>

        {isFormOpen && (
          <div className="blog-glass admin-panel">
            <h2 className="admin-panel-title">{editingId ? 'Edit Interviewer' : 'Add New Interviewer'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              {saveMutation.error && (
                <div className="blog-error">
                  {saveMutation.error instanceof Error ? saveMutation.error.message : 'Failed to save interviewer'}
                </div>
              )}
              <div className="admin-form-row">
                <div>
                  <label htmlFor="interviewer-name" className="admin-label">
                    Name
                  </label>
                  <input id="interviewer-name" type="text" required className="admin-input" {...field('name')} />
                </div>
                <div>
                  <label htmlFor="interviewer-company" className="admin-label">
                    Company
                  </label>
                  <input id="interviewer-company" type="text" required className="admin-input" {...field('company')} />
                </div>
              </div>

              <div className="admin-form-row">
                <div>
                  <label htmlFor="interviewer-role" className="admin-label">
                    Role / title
                  </label>
                  <input
                    id="interviewer-role"
                    type="text"
                    className="admin-input"
                    placeholder="Staff Engineer, Eng Manager..."
                    {...field('role')}
                  />
                </div>
                <div>
                  <label htmlFor="interviewer-rating" className="admin-label">
                    Rating
                  </label>
                  <input
                    id="interviewer-rating"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={5}
                    step={0.1}
                    className="admin-input"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  />
                  <p className="admin-hint">0 to 5 stars</p>
                </div>
              </div>

              <fieldset className="int-type-picker">
                <legend className="admin-label">Interview type</legend>
                <div className="int-type-options">
                  {INTERVIEW_TYPES.map((t) => (
                    <label key={t} className={`int-type-option${form.interview_types.includes(t) ? ' is-on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={form.interview_types.includes(t)}
                        onChange={() => toggleType(t)}
                      />
                      {INTERVIEW_TYPE_LABELS[t]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="admin-form-row">
                <div>
                  <label htmlFor="interviewer-email" className="admin-label">
                    Email
                  </label>
                  <input id="interviewer-email" type="email" className="admin-input" {...field('email')} />
                </div>
                <div>
                  <label htmlFor="interviewer-linkedin" className="admin-label">
                    LinkedIn URL
                  </label>
                  <input
                    id="interviewer-linkedin"
                    type="url"
                    className="admin-input"
                    placeholder="https://linkedin.com/in/..."
                    {...field('linkedin')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="interviewer-notes" className="admin-label">
                  Notes
                </label>
                <textarea
                  id="interviewer-notes"
                  className="admin-input"
                  rows={4}
                  placeholder="Questions asked, what they focused on, feedback..."
                  {...field('notes')}
                />
              </div>

              <div className="admin-form-actions is-end">
                <button
                  type="button"
                  className="blog-btn"
                  onClick={() => {
                    resetForm()
                    setIsFormOpen(false)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saveMutation.isPending} className="blog-btn blog-btn-primary">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isError && (
          <div className="blog-error">{error instanceof Error ? error.message : 'Failed to load interviewers'}</div>
        )}

        {loading ? (
          <div className="blog-loading">
            Loading interviewers<span className="m0tz-dots" aria-hidden="true" />
          </div>
        ) : interviewers.length === 0 ? (
          !isError && (
            <div className="blog-glass blog-empty">
              <p>No interviewers yet.</p>
              <button onClick={() => setIsFormOpen(true)} className="blog-btn blog-btn-primary">
                Add your first interviewer
              </button>
            </div>
          )
        ) : (
          <>
            <div className="blog-glass admin-panel admin-table-panel">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Interview types</th>
                      <th className="is-center">Rating</th>
                      <th className="is-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviewers.map((interviewer) => (
                      <tr key={interviewer.id}>
                        <td className="is-name">
                          <Link to={`/interviewers/${interviewer.id}`} className="admin-name-link">
                            {interviewer.name}
                          </Link>
                        </td>
                        <td>{interviewer.company}</td>
                        <td className="is-small">{interviewer.role}</td>
                        <td className="is-small">
                          {interviewer.interview_types.map((t) => INTERVIEW_TYPE_LABELS[t] ?? t).join(', ')}
                        </td>
                        <td className="is-center admin-num is-star">{interviewer.rating.toFixed(1)} ⭐</td>
                        <td className="is-center">
                          <div className="admin-actions">
                            <button
                              onClick={() => handleEdit(interviewer)}
                              className="blog-btn blog-btn-accent admin-icon-btn"
                              aria-label={`Edit ${interviewer.name}`}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate(interviewer.id)}
                              disabled={deleteMutation.isPending}
                              className="blog-btn blog-btn-danger admin-icon-btn"
                              aria-label={`Delete ${interviewer.name}`}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <nav className="blog-pager" aria-label="Pages">
                <button className="blog-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  ← Previous
                </button>
                <span className="blog-muted">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                  className="blog-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </>
  )
}

export default InterviewerAdmin
