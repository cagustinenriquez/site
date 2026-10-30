import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type CreateRecruiterPayload, type UpdateRecruiterPayload } from '@/lib/api'
import { Trash2, Edit2, Plus } from 'lucide-react'
import { CyberCity } from '@/components/CyberCity'
import './blog.css'
import './admin.css'

const EMPTY_STATS = { total_placements: '0', average_rating: '0' }

function parseStats(stats: typeof EMPTY_STATS) {
  return {
    total_placements: parseInt(stats.total_placements) || 0,
    average_rating: parseFloat(stats.average_rating) || 0,
  }
}

export function RecruiterAdmin() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const limit = 20
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | string | null>(null)
  const [formData, setFormData] = useState<CreateRecruiterPayload>({
    name: '',
    company: '',
    email: '',
    phone: '',
    linkedin: '',
    notes: '',
    reputation: 0,
  })
  // Kept as typed text so partial input like "4." isn't cut off; converted on save
  const [stats, setStats] = useState(EMPTY_STATS)

  const { data, isLoading: loading, isError, error } = useQuery({
    queryKey: ['recruiters-admin', page],
    queryFn: () => api.getRecruiters(page, limit),
  })

  const recruiters = data?.recruiters || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  // Create Recruiter
  const createMutation = useMutation({
    // The API ignores placements and rating on create, so set them with a follow-up update
    mutationFn: async ({ payload, extra }: { payload: CreateRecruiterPayload; extra: UpdateRecruiterPayload }) => {
      const created = await api.createRecruiter(payload)
      if (extra.total_placements || extra.average_rating) {
        return api.updateRecruiter(created.id, extra)
      }
      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiters-admin'] })
      queryClient.invalidateQueries({ queryKey: ['recruiters'] })
      resetForm()
      setIsFormOpen(false)
    },
  })

  // Update Recruiter
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: UpdateRecruiterPayload }) =>
      api.updateRecruiter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiters-admin'] })
      queryClient.invalidateQueries({ queryKey: ['recruiters'] })
      resetForm()
      setIsFormOpen(false)
    },
  })

  // Delete Recruiter
  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => api.deleteRecruiter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiters-admin'] })
      queryClient.invalidateQueries({ queryKey: ['recruiters'] })
    },
  })

  const handleEditRecruiter = async (id: number | string) => {
    const recruiter = recruiters.find((r) => r.id === id)
    if (recruiter) {
      setFormData({
        name: recruiter.name,
        company: recruiter.company,
        email: recruiter.email,
        phone: recruiter.phone || '',
        linkedin: recruiter.linkedin || '',
        notes: recruiter.notes || '',
        reputation: recruiter.reputation,
      })
      setStats({
        total_placements: String(recruiter.total_placements),
        average_rating: String(recruiter.average_rating),
      })
      setEditingId(id)
      setIsFormOpen(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const extra = parseStats(stats)
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: { ...formData, ...extra },
      })
    } else {
      createMutation.mutate({ payload: formData, extra })
    }
  }

  const resetForm = () => {
    setFormData({ name: '', company: '', email: '', phone: '', linkedin: '', notes: '', reputation: 0 })
    setStats(EMPTY_STATS)
    setEditingId(null)
    createMutation.reset()
    updateMutation.reset()
  }

  const saving = createMutation.isPending || updateMutation.isPending
  const saveError = createMutation.error || updateMutation.error

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell admin-shell">
        <header className="admin-header">
          <div>
            <p className="section-kicker">Admin</p>
            <h1 className="admin-title">Recruit Admin</h1>
            <p className="admin-subtitle">Manage recruiters and their placements</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setIsFormOpen(!isFormOpen)
            }}
            className="blog-btn blog-btn-primary"
          >
            <Plus size={18} />
            Add Recruiter
          </button>
        </header>

        {isFormOpen && (
          <div className="blog-glass admin-panel">
            <h2 className="admin-panel-title">{editingId ? 'Edit Recruiter' : 'Add New Recruiter'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              {saveError && (
                <div className="blog-error">
                  {saveError instanceof Error ? saveError.message : 'Failed to save recruiter'}
                </div>
              )}
              <div className="admin-form-row">
                <div>
                  <label htmlFor="recruiter-name" className="admin-label">
                    Name
                  </label>
                  <input
                    id="recruiter-name"
                    type="text"
                    required
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="recruiter-company" className="admin-label">
                    Company
                  </label>
                  <input
                    id="recruiter-company"
                    type="text"
                    required
                    className="admin-input"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="recruiter-email" className="admin-label">
                  Email
                </label>
                <input
                  id="recruiter-email"
                  type="email"
                  className="admin-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="admin-form-row">
                <div>
                  <label htmlFor="recruiter-phone" className="admin-label">
                    Phone
                  </label>
                  <input
                    id="recruiter-phone"
                    type="tel"
                    className="admin-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="recruiter-linkedin" className="admin-label">
                    LinkedIn URL
                  </label>
                  <input
                    id="recruiter-linkedin"
                    type="url"
                    className="admin-input"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="recruiter-reputation" className="admin-label">
                  Reputation
                </label>
                <input
                  id="recruiter-reputation"
                  type="number"
                  className="admin-input"
                  value={formData.reputation}
                  onChange={(e) => setFormData({ ...formData, reputation: parseInt(e.target.value) || 0 })}
                />
                <p className="admin-hint">Positive or negative number</p>
              </div>

              <div className="admin-form-row">
                <div>
                  <label htmlFor="recruiter-placements" className="admin-label">
                    Placements
                  </label>
                  <input
                    id="recruiter-placements"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    className="admin-input"
                    value={stats.total_placements}
                    onChange={(e) => setStats({ ...stats, total_placements: e.target.value })}
                  />
                  <p className="admin-hint">How many times they placed you</p>
                </div>
                <div>
                  <label htmlFor="recruiter-rating" className="admin-label">
                    Rating
                  </label>
                  <input
                    id="recruiter-rating"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={5}
                    step={0.1}
                    className="admin-input"
                    value={stats.average_rating}
                    onChange={(e) => setStats({ ...stats, average_rating: e.target.value })}
                  />
                  <p className="admin-hint">0 to 5 stars</p>
                </div>
              </div>

              <div>
                <label htmlFor="recruiter-notes" className="admin-label">
                  Notes
                </label>
                <textarea
                  id="recruiter-notes"
                  className="admin-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
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
                <button type="submit" disabled={saving} className="blog-btn blog-btn-primary">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isError && (
          <div className="blog-error">{error instanceof Error ? error.message : 'Failed to load recruiters'}</div>
        )}

        {loading ? (
          <div className="blog-loading">
            Loading recruiters<span className="m0tz-dots" aria-hidden="true" />
          </div>
        ) : recruiters.length === 0 ? (
          <div className="blog-glass blog-empty">
            <p>No recruiters yet.</p>
            <button onClick={() => setIsFormOpen(true)} className="blog-btn blog-btn-primary">
              Create your first recruiter
            </button>
          </div>
        ) : (
          <>
            <div className="blog-glass admin-panel admin-table-panel">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Email</th>
                      <th className="is-center">Reputation</th>
                      <th className="is-center">Placements</th>
                      <th className="is-center">Rating</th>
                      <th className="is-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recruiters.map((recruiter) => (
                      <tr key={recruiter.id}>
                        <td className="is-name">{recruiter.name}</td>
                        <td>{recruiter.company}</td>
                        <td className="is-small">{recruiter.email}</td>
                        <td className={`is-center admin-num ${recruiter.reputation >= 0 ? 'is-good' : 'is-bad'}`}>
                          {recruiter.reputation >= 0 ? '+' : ''}
                          {recruiter.reputation}
                        </td>
                        <td className="is-center admin-num">{recruiter.total_placements}</td>
                        <td className="is-center admin-num is-star">{recruiter.average_rating.toFixed(1)} ⭐</td>
                        <td className="is-center">
                          <div className="admin-actions">
                            <button
                              onClick={() => handleEditRecruiter(recruiter.id)}
                              className="blog-btn blog-btn-accent admin-icon-btn"
                              aria-label={`Edit ${recruiter.name}`}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate(recruiter.id)}
                              disabled={deleteMutation.isPending}
                              className="blog-btn blog-btn-danger admin-icon-btn"
                              aria-label={`Delete ${recruiter.name}`}
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

export default RecruiterAdmin
