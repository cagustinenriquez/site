import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type CreateRecruiterPayload, type UpdateRecruiterPayload } from '@/lib/api'
import { Trash2, Edit2, Plus } from 'lucide-react'

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
    bio: '',
  })

  const { data, isLoading: loading, isError, error } = useQuery({
    queryKey: ['recruiters-admin', page],
    queryFn: () => api.getRecruiters(page, limit),
  })

  const recruiters = data?.recruiters || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  // Create Recruiter
  const createMutation = useMutation({
    mutationFn: (payload: CreateRecruiterPayload) => api.createRecruiter(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiters-admin'] })
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
        bio: recruiter.bio || '',
      })
      setEditingId(id)
      setIsFormOpen(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: formData,
      })
    } else {
      createMutation.mutate(formData)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', company: '', email: '', phone: '', linkedin: '', bio: '' })
    setEditingId(null)
  }

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '12px',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%)', padding: '3rem 1rem', paddingTop: '6rem' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
              Recruit Admin
            </h1>
            <p style={{ color: '#cbd5e1', margin: 0, fontSize: '1rem' }}>
              Manage recruiters and their placements
            </p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setIsFormOpen(!isFormOpen)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              borderRadius: '8px',
              color: '#0ea5e9',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(14, 165, 233, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)'
            }}
          >
            <Plus size={18} />
            Add Recruiter
          </button>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div style={{ ...glassStyle, padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: '600', margin: '0 0 1.5rem 0' }}>
              {editingId ? 'Edit Recruiter' : 'Add New Recruiter'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Company
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setIsFormOpen(false)
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 200ms',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    borderRadius: '8px',
                    color: '#0ea5e9',
                    cursor: createMutation.isPending || updateMutation.isPending ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 200ms',
                    opacity: createMutation.isPending || updateMutation.isPending ? 0.5 : 1,
                  }}
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error */}
        {isError && (
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
            {error instanceof Error ? error.message : 'Failed to load recruiters'}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Loading recruiters...
          </div>
        ) : recruiters.length === 0 ? (
          <div style={{ ...glassStyle, padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>No recruiters yet.</p>
            <button
              onClick={() => setIsFormOpen(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                borderRadius: '8px',
                color: '#0ea5e9',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                marginTop: '1rem',
              }}
            >
              Create your first recruiter
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div style={{ ...glassStyle, overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.95rem',
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>
                        Name
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>
                        Company
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>
                        Email
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#cbd5e1', fontWeight: '600' }}>
                        Score
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#cbd5e1', fontWeight: '600' }}>
                        Placements
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#cbd5e1', fontWeight: '600' }}>
                        Rating
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#cbd5e1', fontWeight: '600' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recruiters.map((recruiter) => (
                      <tr key={recruiter.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                        <td style={{ padding: '1rem', color: '#f1f5f9' }}>
                          {recruiter.name}
                        </td>
                        <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                          {recruiter.company}
                        </td>
                        <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                          {recruiter.email}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#f1f5f9', fontWeight: '600' }}>
                          {recruiter.reputation_score}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#f1f5f9' }}>
                          {recruiter.total_placements}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#fbbf24' }}>
                          {recruiter.average_rating.toFixed(1)} ⭐
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleEditRecruiter(recruiter.id)}
                              style={{
                                padding: '0.5rem',
                                background: 'rgba(14, 165, 233, 0.15)',
                                border: '1px solid rgba(14, 165, 233, 0.3)',
                                borderRadius: '6px',
                                color: '#0ea5e9',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate(recruiter.id)}
                              disabled={deleteMutation.isPending}
                              style={{
                                padding: '0.5rem',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                color: '#ef4444',
                                cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: deleteMutation.isPending ? 0.5 : 1,
                              }}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: page === 1 ? 'rgba(148, 163, 184, 0.1)' : 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid ' + (page === 1 ? 'rgba(148, 163, 184, 0.1)' : 'rgba(14, 165, 233, 0.3)'),
                    borderRadius: '8px',
                    color: page === 1 ? '#64748b' : '#0ea5e9',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    opacity: page === 1 ? 0.5 : 1,
                  }}
                >
                  ← Previous
                </button>

                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Page <span style={{ fontWeight: '600', color: '#cbd5e1' }}>{page}</span> of{' '}
                  <span style={{ fontWeight: '600', color: '#cbd5e1' }}>{totalPages}</span>
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: page === totalPages ? 'rgba(148, 163, 184, 0.1)' : 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid ' + (page === totalPages ? 'rgba(148, 163, 184, 0.1)' : 'rgba(14, 165, 233, 0.3)'),
                    borderRadius: '8px',
                    color: page === totalPages ? '#64748b' : '#0ea5e9',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    opacity: page === totalPages ? 0.5 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default RecruiterAdmin
