import { useEffect, useState } from 'react'
import { useApp } from '../lib/store'
import { Eyebrow, Btn, Sheet } from './ui'

/* Build-useful signal:
   fit       -> does Vinna solve a real need (product-market fit signal)
   mustHave  -> which capabilities would make it a daily habit (roadmap priority)
   message   -> the single most important thing in the tester's own words
*/
const FIT = [
  { key: 'strong', label: 'A strong fit' },
  { key: 'maybe', label: 'Could be, with work' },
  { key: 'not_yet', label: 'Not yet' },
]

const MUST_HAVE = [
  'Cycle & symptom tracking',
  'Activity sync (Strava, Oura)',
  'Food & nutrition guidance',
  'Menopause & perimenopause support',
  'Sharing with partner or care team',
  'Trustworthy health answers',
  'Reminders & screenings',
  'Something else',
]

function FeedbackSurvey({ context, onSent }: { context: string; onSent: () => void }) {
  const { submitFeedback } = useApp()
  const [fit, setFit] = useState<string | null>(null)
  const [mustHave, setMustHave] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  function toggle(item: string) {
    setMustHave(prev => (prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]))
  }

  async function send() {
    if (!fit) return
    setBusy(true)
    await submitFeedback({ fit, mustHave, message: message.trim(), context })
    setBusy(false)
    onSent()
  }

  return (
    <div className="stack" style={{ marginTop: 4 }}>
      <div>
        <p className="v-label" style={{ marginBottom: 10 }}>How well does Vinna fit a real need in your life?</p>
        <div className="row wrap" style={{ gap: 8 }}>
          {FIT.map(f => (
            <button key={f.key} className={`chip ${fit === f.key ? 'on' : ''}`} onClick={() => setFit(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {fit && (
        <>
          <div className="reveal">
            <p className="v-label" style={{ marginBottom: 10 }}>What would make Vinna a daily must-have for you? Pick any.</p>
            <div className="row wrap" style={{ gap: 8 }}>
              {MUST_HAVE.map(m => (
                <button key={m} className={`chip ${mustHave.includes(m) ? 'on' : ''}`} onClick={() => toggle(m)}>{m}</button>
              ))}
            </div>
          </div>

          <div className="reveal">
            <p className="v-label" style={{ marginBottom: 10 }}>In your words, what is the one thing Vinna must get right for you?</p>
            <textarea
              className="field"
              rows={3}
              placeholder="The thing that would make or break it for you."
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <Btn onClick={send} disabled={busy || !fit}>{busy ? 'Sending…' : 'Send feedback →'}</Btn>
        </>
      )}
    </div>
  )
}

function ThankYou({ onClose }: { onClose?: () => void }) {
  return (
    <div className="card accent lichen">
      <Eyebrow tone="lichen">● Sent</Eyebrow>
      <p className="v-body-sm" style={{ marginTop: 10 }}>
        Thank you. This is exactly what shapes what we build next, and we read every word.
      </p>
      {onClose && <div style={{ marginTop: 16 }}><Btn variant="secondary" onClick={onClose}>Close</Btn></div>}
    </div>
  )
}

/* Auto-opens 3 seconds after a screen loads, once per session per slot.
   Used on Today (slot="today") and the You tab (slot="you"). Once feedback is
   submitted anywhere it never auto-opens again. */
export function FeedbackAutoPrompt({ toast, slot = 'today' }: { toast: (m: string) => void; slot?: string }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('vinna_feedback_done')) return
      if (sessionStorage.getItem(`vinna_feedback_shown_${slot}`)) return
    } catch { /* ignore */ }
    const t = setTimeout(() => {
      setOpen(true)
      try { sessionStorage.setItem(`vinna_feedback_shown_${slot}`, '1') } catch { /* ignore */ }
    }, 3000)
    return () => clearTimeout(t)
  }, [slot])

  function close() { setOpen(false) }

  return (
    <Sheet open={open} onClose={close} highlight>
      <Eyebrow>● Help shape Vinna</Eyebrow>
      <h2 className="v-h2" style={{ margin: '10px 0 6px' }}>Build Vinna with us</h2>
      <p className="v-meta" style={{ marginBottom: 18 }}>
        You are one of our first testers. A few quick taps tell us how to make Vinna genuinely useful for you.
      </p>
      {done ? (
        <ThankYou onClose={close} />
      ) : (
        <>
          <FeedbackSurvey
            context={slot}
            onSent={() => { setDone(true); try { localStorage.setItem('vinna_feedback_done', '1') } catch { /* ignore */ } toast('Feedback sent. Thank you.') }}
          />
          <button
            className="btn-ghost center"
            style={{ display: 'block', width: '100%', marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--fg-3)', padding: '8px 0' }}
            onClick={close}
          >
            Maybe later
          </button>
        </>
      )}
    </Sheet>
  )
}

/* Hot spot 2: always-available sheet, opened from the You tab. */
export function FeedbackSheet({ open, onClose, toast }: { open: boolean; onClose: () => void; toast: (m: string) => void }) {
  const [done, setDone] = useState(false)
  useEffect(() => { if (open) setDone(false) }, [open])
  return (
    <Sheet open={open} onClose={onClose} highlight>
      <Eyebrow>Share feedback</Eyebrow>
      <h2 className="v-h2" style={{ margin: '10px 0 6px' }}>Tell us what you think</h2>
      <p className="v-meta" style={{ marginBottom: 18 }}>
        Anything from a small annoyance to a big idea. It reaches the team directly and shapes what we build.
      </p>
      {done ? (
        <ThankYou onClose={onClose} />
      ) : (
        <FeedbackSurvey
          context="you"
          onSent={() => { setDone(true); try { localStorage.setItem('vinna_feedback_done', '1') } catch { /* ignore */ } toast('Feedback sent. Thank you.') }}
        />
      )}
    </Sheet>
  )
}
