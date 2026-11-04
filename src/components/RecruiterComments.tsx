import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiError, type RecruiterComment } from '@/lib/api'
import { MessageSquare, Send, Trash2 } from 'lucide-react'

const MAX_LENGTH = 2000

// FastAPI answers "Not Found" when no route matches, i.e. a backend without comments
function isMissingEndpoint(err: unknown) {
  return err instanceof ApiError && err.status === 404 && err.message === 'Not Found'
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function RecruiterComments({ recruiterId }: { recruiterId: string }) {
  const queryClient = useQueryClient()
  const queryKey = ['recruiter-comments', recruiterId]
  const [draft, setDraft] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const { data: comments = [], isLoading, error, isError } = useQuery({
    queryKey,
    queryFn: () => api.getRecruiterComments(recruiterId),
    retry: (count, err) => !isMissingEndpoint(err) && count < 2,
  })

  const addMutation = useMutation({
    mutationFn: (body: string) => api.addRecruiterComment(recruiterId, body),
    onSuccess: (created) => {
      queryClient.setQueryData<RecruiterComment[]>(queryKey, (old = []) => [created, ...old])
      setDraft('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => api.deleteRecruiterComment(recruiterId, commentId),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData<RecruiterComment[]>(queryKey, (old = []) => old.filter((c) => c.id !== commentId))
      setConfirmingId(null)
    },
  })

  const unavailable = isError && isMissingEndpoint(error)
  const body = draft.trim()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (body && !addMutation.isPending) addMutation.mutate(body)
  }

  return (
    <section className="blog-glass admin-panel" aria-labelledby="rec-comments-title">
      <h2 id="rec-comments-title" className="admin-panel-title">
        Comments{comments.length > 0 && <span className="rec-comment-count">{comments.length}</span>}
      </h2>

      {unavailable ? (
        <p className="blog-muted">Comments aren't available yet. The server needs to be updated first.</p>
      ) : (
        <>
          <form onSubmit={submit} className="rec-comment-form">
            <label htmlFor="rec-comment-input" className="admin-label">
              Add a comment
            </label>
            <textarea
              id="rec-comment-input"
              className="admin-input"
              rows={3}
              maxLength={MAX_LENGTH}
              placeholder="How was working with this recruiter?"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e)
              }}
            />
            <div className="rec-comment-form-foot">
              <span className="blog-muted">
                {draft.length}/{MAX_LENGTH}
              </span>
              <button type="submit" className="blog-btn blog-btn-primary" disabled={!body || addMutation.isPending}>
                <Send size={16} />
                {addMutation.isPending ? 'Posting…' : 'Post'}
              </button>
            </div>
            {addMutation.isError && (
              <div className="blog-error">
                {addMutation.error instanceof Error ? addMutation.error.message : 'Failed to post comment'}
              </div>
            )}
          </form>

          {isError && (
            <div className="blog-error">{error instanceof Error ? error.message : 'Failed to load comments'}</div>
          )}
          {deleteMutation.isError && (
            <div className="blog-error">
              {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete comment'}
            </div>
          )}

          {isLoading ? (
            <p className="blog-loading">
              Loading comments<span className="m0tz-dots" aria-hidden="true" />
            </p>
          ) : (
            !isError &&
            (comments.length === 0 ? (
              <p className="blog-muted rec-comments-empty">
                <MessageSquare size={18} aria-hidden="true" />
                No comments yet.
              </p>
            ) : (
              <ul className="rec-comments">
                {comments.map((comment) => (
                  <li key={comment.id} className="rec-comment">
                    <div className="rec-comment-head">
                      <span className="rec-comment-author">{comment.author}</span>
                      <time dateTime={comment.created_at} className="blog-muted">
                        {formatDate(comment.created_at)}
                      </time>
                      {confirmingId === comment.id ? (
                        <span className="rec-comment-actions">
                          <button
                            type="button"
                            className="blog-btn blog-btn-danger"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(comment.id)}
                          >
                            Delete
                          </button>
                          <button type="button" className="blog-btn" onClick={() => setConfirmingId(null)}>
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="blog-btn blog-btn-danger admin-icon-btn rec-comment-delete"
                          aria-label="Delete comment"
                          title="Delete comment"
                          onClick={() => setConfirmingId(comment.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <p className="rec-comment-body">{comment.body}</p>
                  </li>
                ))}
              </ul>
            ))
          )}
        </>
      )}
    </section>
  )
}

export default RecruiterComments
