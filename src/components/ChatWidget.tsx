import { useEffect, useRef, useState, type FormEvent } from 'react'
import { M0tz } from './M0tz'
import { contact } from '@/content/profile'

// "Chat with m0tz": a floating button that opens a small chat window. Replies come from
// /api/chat (functions/api/chat.ts). In local dev that endpoint doesn't exist, so the
// window falls back to labelled sample answers from src/lib/chatPreview.ts.

type Msg = { role: 'user' | 'assistant'; content: string }

const MAX_CHARS = 500
const MAX_USER_TURNS = 15
const GREETING = "Hey, I'm m0tz, Agustin's pixel-art sidekick. Ask me about his work, his stack, or whether he's free for your project."
const SUGGESTIONS = ["What's his stack?", 'Is he open to remote work?', 'Tell me about a project', 'How do I contact him?']

const ERRORS: Record<string, string> = {
  not_configured: `My AI link is offline right now. You can reach Agustin directly at ${contact.email}.`,
  rate_limited: `That's a lot of questions! Take a breather, or email Agustin at ${contact.email}.`,
  busy: `Too many people chatting at once. Try again in a minute, or email ${contact.email}.`,
}
const FALLBACK_ERROR = `Something went wrong on my end. Try again, or email Agustin at ${contact.email}.`

async function ask(history: Msg[]): Promise<string> {
  let res: Response | null = null
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    })
  } catch {
    res = null
  }
  // Local preview: `npm run dev` has no /api/chat, so use sample answers (dev builds only)
  if (import.meta.env.DEV && (!res || res.status === 404 || !res.headers.get('content-type')?.includes('json'))) {
    const { previewReply } = await import('@/lib/chatPreview')
    await new Promise((r) => setTimeout(r, 700))
    return previewReply(history[history.length - 1].content)
  }
  if (!res) return FALLBACK_ERROR
  const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string }
  return data.reply ?? ERRORS[data.error ?? ''] ?? FALLBACK_ERROR
}

export function ChatWidget({ onContactClick }: { onContactClick: () => void }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const userTurns = messages.filter((m) => m.role === 'user').length
  const outOfTurns = userTurns >= MAX_USER_TURNS

  // Esc closes; focus the input when the window opens
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Keep the newest message in view
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const send = async (text: string) => {
    const content = text.trim().slice(0, MAX_CHARS)
    if (!content || busy || outOfTurns) return
    const history: Msg[] = [...messages, { role: 'user', content }]
    setMessages(history)
    setDraft('')
    setBusy(true)
    const reply = await ask(history)
    setMessages([...history, { role: 'assistant', content: reply }])
    setBusy(false)
    inputRef.current?.focus()
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void send(draft)
  }

  return (
    <>
      <button
        type="button"
        className={`chat-fab${open ? ' is-open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="m0tz-chat"
        aria-label={open ? 'Close chat with m0tz' : 'Chat with m0tz'}
      >
        <M0tz size={34} />
        <span className="chat-fab-label">Chat</span>
        <span className="chat-fab-dot" aria-hidden="true" />
      </button>

      <section id="m0tz-chat" className={`chat-panel${open ? ' is-open' : ''}`} role="dialog" aria-label="Chat with m0tz" aria-hidden={!open}>
        <header className="chat-head">
          <M0tz size={30} />
          <div className="chat-head-text">
            <p className="chat-title">
              m0tz <span className="m0tz-status">online</span>
            </p>
            <p className="chat-sub">AI sidekick · can get things wrong</p>
          </div>
          <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
            ×
          </button>
        </header>

        <div className="chat-log" ref={listRef} aria-live="polite">
          <div className="chat-msg is-bot">
            <p>{GREETING}</p>
          </div>
          {messages.length === 0 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chat-chip" onClick={() => void send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role === 'user' ? 'is-user' : 'is-bot'}`}>
              <p>{m.content}</p>
            </div>
          ))}
          {busy && (
            <div className="chat-msg is-bot is-typing" aria-label="m0tz is typing">
              <span />
              <span />
              <span />
            </div>
          )}
          {outOfTurns && !busy && (
            <p className="chat-note">That's the end of this chat. For more, email {contact.email}.</p>
          )}
        </div>

        <form className="chat-form" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            className="chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_CHARS}
            placeholder={outOfTurns ? 'Chat limit reached' : 'Ask m0tz about Agustin…'}
            aria-label="Your message"
            disabled={outOfTurns}
            tabIndex={open ? 0 : -1}
          />
          <button type="submit" className="chat-send" disabled={!draft.trim() || busy || outOfTurns} aria-label="Send" tabIndex={open ? 0 : -1}>
            ➤
          </button>
        </form>
        <button
          type="button"
          className="chat-human"
          tabIndex={open ? 0 : -1}
          onClick={() => {
            setOpen(false)
            onContactClick()
          }}
        >
          Prefer a human? Contact Agustin →
        </button>
      </section>
    </>
  )
}
