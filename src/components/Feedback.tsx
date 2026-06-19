import { useEffect, useState } from 'react'
import { useApp } from '../lib/store'
import { Eyebrow, Btn, Sheet } from './ui'

const MOODS = [
  { key: 'love', label: 'Love it' },
  { key: 'okay', label: "It's okay" },
  { key: 'rough', label: 'Needs work' },
]

/* Shared sentiment + note form used by both feedback surfaces. */
function FeedbackForm({ context, onSent, compact = false }: { context: string; onSent: () => void; compact?: boolean }) {
  const { submitFeedback } = useApp()
  const [mood, setMood] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  async function send() {
    if (!mood) return
    setBusy(true)
    await submitFeedback(mood, note.trim(), context)
    setBusy(false)
    onSent()
  }

  return (
    <>
      <div className="row wrap" style={{ gap: 8 }}>
        {MOODS.map(m => (
          <button key={m.key} className={`chip ${mood === m.key ? 'on' : ''}`} onClick={() => setMood(m.key)}>{m.label}</button>
        ))}
      </div>
      {mood && (
        <div className="stack-sm" style={{ marginTop: 14 }}>
          <textarea
            className="field"
            rows={compact ? 2 : 3}
            placeholder="Anything you would change or want more of. Optional."
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ resize: 'none' }}
          />
          <Btn sm onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Send feedback →'}</Btn>
        </div>
      )}
    </>
  )
}

/* Hot spot 1: in-flow card on the Today screen. */
export function FeedbackInline({ toast }: { toast: (m: string) => void }) {
  const [done, setDone] = useState(false)
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <div className="card accent reveal" style={{ marginTop: 16 }}>
      {done ? (
        <>
          <Eyebrow tone="lichen">● Thank you</Eyebrow>
          <p className="v-body-sm" style={{ marginTop: 10 }}>Noted. Your take goes straight to the people building Vinna.</p>
        </>
      ) : (
        <>
          <Eyebrow>● Help shape Vinna</Eyebrow>
          <h3 className="v-card-title" style={{ margin: '12px 0 4px', fontSize: 16 }}>How is Vinna feeling so far?</h3>
          <p className="v-body-sm" style={{ marginBottom: 14 }}>
            You are one of our first testers. A quick word helps us build the right thing.
          </p>
          <FeedbackForm context="today" onSent={() => { setDone(true); toast('Feedback sent. Thank you.') }} compact />
          <button
            className="btn-ghost"
            style={{ display: 'block', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--fg-3)' }}
            onClick={() => setHidden(true)}
          >
            Maybe later
          </button>
        </>
      )}
    </div>
  )
}

/* Hot spot 2: always-available sheet, opened from the You tab. */
export function FeedbackSheet({ open, onClose, toast }: { open: boolean; onClose: () => void; toast: (m: string) => void }) {
  const [done, setDone] = useState(false)
  useEffect(() => { if (open) setDone(false) }, [open])
  return (
    <Sheet open={open} onClose={onClose}>
      <Eyebrow>Share feedback</Eyebrow>
      <h2 className="v-h2" style={{ margin: '10px 0 6px' }}>Tell us what you think</h2>
      <p className="v-meta" style={{ marginBottom: 20 }}>
        Anything from a small annoyance to a big idea. It reaches the team directly.
      </p>
      {done ? (
        <div className="card accent lichen">
          <Eyebrow tone="lichen">● Sent</Eyebrow>
          <p className="v-body-sm" style={{ marginTop: 10 }}>Thank you for helping shape Vinna. Close this when you are ready.</p>
          <div style={{ marginTop: 16 }}><Btn variant="secondary" onClick={onClose}>Close</Btn></div>
        </div>
      ) : (
        <FeedbackForm context="you" onSent={() => { setDone(true); toast('Feedback sent. Thank you.') }} />
      )}
    </Sheet>
  )
}
