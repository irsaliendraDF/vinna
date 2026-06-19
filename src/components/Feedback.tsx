import { useEffect, useState } from 'react'
import { useApp } from '../lib/store'
import { Eyebrow, Btn, Sheet } from './ui'

/* Two distinct surveys so testers are asked something fresh on each surface.
   Both store into the same columns (fit = single choice, must_have = multi
   choice, message = open text); the `context` value ('today' | 'you') tells you
   which survey a row came from.

   today -> product fit & roadmap (does it meet a need, what to build next)
   you   -> experience & retention (would they stay, recommend, what is missing)
*/
type Survey = {
  single: { label: string; options: { key: string; label: string }[] }
  multi: { label: string; options: string[] }
  open: { label: string; placeholder: string }
}

const SURVEYS: Record<string, Survey> = {
  today: {
    single: {
      label: 'How well does Vinna fit a real need in your life?',
      options: [
        { key: 'strong', label: 'A strong fit' },
        { key: 'maybe', label: 'Could be, with work' },
        { key: 'not_yet', label: 'Not yet' },
      ],
    },
    multi: {
      label: 'What would make Vinna a daily must-have for you? Pick any.',
      options: [
        'Cycle & symptom tracking',
        'Activity sync (Strava, Oura)',
        'Food & nutrition guidance',
        'Menopause & perimenopause support',
        'Sharing with partner or care team',
        'Trustworthy health answers',
        'Reminders & screenings',
        'Something else',
      ],
    },
    open: {
      label: 'In your words, what is the one thing Vinna must get right for you?',
      placeholder: 'The thing that would make or break it for you.',
    },
  },
  you: {
    single: {
      label: 'Now that you have looked around, how likely are you to keep using Vinna?',
      options: [
        { key: 'daily', label: 'I would use it daily' },
        { key: 'sometimes', label: 'Now and then' },
        { key: 'unlikely', label: 'Probably not yet' },
      ],
    },
    multi: {
      label: 'What would make you recommend Vinna to a friend? Pick any.',
      options: [
        'Easier to find my way around',
        'More personalized to me',
        'Proof the guidance is trustworthy',
        'A fair price',
        'Works with my other apps',
        'More control over my data',
        'Something else',
      ],
    },
    open: {
      label: 'What is missing before Vinna becomes part of your routine?',
      placeholder: 'The thing that would keep you coming back.',
    },
  },
}

const PROMPT_COPY: Record<string, { eyebrow: string; title: string; intro: string }> = {
  today: {
    eyebrow: '● Help shape Vinna',
    title: 'Build Vinna with us',
    intro: 'You are one of our first testers. A few quick taps tell us how to make Vinna genuinely useful for you.',
  },
  you: {
    eyebrow: '● Your experience',
    title: 'How is Vinna working for you?',
    intro: 'You have had a look around. Tell us how it feels to use, and what would keep you coming back.',
  },
}

function FeedbackSurvey({ variant, context, onSent }: { variant: string; context: string; onSent: () => void }) {
  const { submitFeedback } = useApp()
  const survey = SURVEYS[variant] ?? SURVEYS.today
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
        <p className="v-label" style={{ marginBottom: 10 }}>{survey.single.label}</p>
        <div className="row wrap" style={{ gap: 8 }}>
          {survey.single.options.map(o => (
            <button key={o.key} className={`chip ${fit === o.key ? 'on' : ''}`} onClick={() => setFit(o.key)}>{o.label}</button>
          ))}
        </div>
      </div>

      {fit && (
        <>
          <div className="reveal">
            <p className="v-label" style={{ marginBottom: 10 }}>{survey.multi.label}</p>
            <div className="row wrap" style={{ gap: 8 }}>
              {survey.multi.options.map(m => (
                <button key={m} className={`chip ${mustHave.includes(m) ? 'on' : ''}`} onClick={() => toggle(m)}>{m}</button>
              ))}
            </div>
          </div>

          <div className="reveal">
            <p className="v-label" style={{ marginBottom: 10 }}>{survey.open.label}</p>
            <textarea
              className="field"
              rows={3}
              placeholder={survey.open.placeholder}
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
   Used on Today (slot="today") and the You tab (slot="you"), each with its own
   survey. Once feedback is submitted anywhere it never auto-opens again. */
export function FeedbackAutoPrompt({ toast, slot = 'today' }: { toast: (m: string) => void; slot?: string }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const copy = PROMPT_COPY[slot] ?? PROMPT_COPY.today

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
      <Eyebrow>{copy.eyebrow}</Eyebrow>
      <h2 className="v-h2" style={{ margin: '10px 0 6px' }}>{copy.title}</h2>
      <p className="v-meta" style={{ marginBottom: 18 }}>{copy.intro}</p>
      {done ? (
        <ThankYou onClose={close} />
      ) : (
        <>
          <FeedbackSurvey
            variant={slot}
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

/* Always-available sheet, opened from the You tab. Uses the You survey. */
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
          variant="you"
          context="you"
          onSent={() => { setDone(true); try { localStorage.setItem('vinna_feedback_done', '1') } catch { /* ignore */ } toast('Feedback sent. Thank you.') }}
        />
      )}
    </Sheet>
  )
}
