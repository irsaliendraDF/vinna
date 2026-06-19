import { useState } from 'react'
import { useApp } from '../lib/store'
import { isSupabaseConfigured } from '../lib/supabase'
import { Wordmark, Eyebrow, Btn } from '../components/ui'

type View = 'welcome' | 'auth'

export function Onboarding() {
  const { continueAsGuest } = useApp()
  const [view, setView] = useState<View>('welcome')
  const [tour, setTour] = useState<number | null>(null)

  if (tour !== null) return <Tour step={tour} onNext={() => (tour >= 3 ? continueAsGuest() : setTour(tour + 1))} onBack={() => (tour === 0 ? setTour(null) : setTour(tour - 1))} />
  if (view === 'auth') return <Auth onBack={() => setView('welcome')} />

  return (
    <div className="auth-screen pad-top-safe">
      <div className="grow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="reveal">
          <Wordmark className="" />
          <h1 className="v-display" style={{ marginTop: 28 }}>
            Whole-life
            <em>women's health.</em>
          </h1>
          <p className="v-quote" style={{ marginTop: 20, color: 'var(--fg-2)', maxWidth: 320 }}>
            An intelligent health concierge that grows with you, every cycle, every stage.
          </p>
        </div>
      </div>

      <div className="stack-sm reveal d2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}>
        <Btn onClick={() => setTour(0)}>Take the tour →</Btn>
        <Btn variant="secondary" onClick={() => setView('auth')}>Create account or sign in</Btn>
        <p className="v-meta center" style={{ marginTop: 8 }}>
          {isSupabaseConfigured ? 'Secure email sign-in · No data leaves your account' : 'Preview build · the tour runs on demo data'}
        </p>
      </div>
    </div>
  )
}

/* ---------- real auth (Supabase) ---------- */
function Auth({ onBack }: { onBack: () => void }) {
  const { signUp, signIn, signInMagic, continueAsGuest } = useApp()
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const isSignup = mode === 'signup'
  const ready = isSignup
    ? Boolean(name.trim() && email && password && consent)
    : Boolean(email && password)

  async function submit() {
    if (isSignup && !consent) { setMsg('Please confirm the note below to create your account.'); return }
    setBusy(true); setMsg(null)
    const err = isSignup ? await signUp(email, password, name) : await signIn(email, password)
    setBusy(false)
    if (err) setMsg(err)
    else if (isSupabaseConfigured && isSignup) setMsg('Check your email to confirm, then sign in. Or take the tour for now.')
  }

  async function magic() {
    if (!email) { setMsg('Enter your email first.'); return }
    if (isSignup && (!name.trim() || !consent)) { setMsg('Add your name and confirm the note below first.'); return }
    setBusy(true); setMsg(null)
    const err = await signInMagic(email, name)
    setBusy(false)
    setMsg(err ?? 'Magic link sent. Check your email.')
  }

  return (
    <div className="auth-screen pad-top-safe">
      <button className="icon-btn" style={{ alignSelf: 'flex-start' }} onClick={onBack}>←</button>
      <div className="reveal" style={{ marginTop: 8 }}>
        <Eyebrow>{isSignup ? 'Create account' : 'Welcome back'}</Eyebrow>
        <h1 className="v-h2" style={{ marginTop: 10 }}>
          {isSignup ? 'Start with Vinna.' : 'Good to see you.'}
        </h1>
      </div>

      <div className="stack-sm" style={{ marginTop: 16 }}>
        {isSignup && (
          <div>
            <label className="field-label">What should Vinna call you?</label>
            <input className="field" type="text" autoComplete="given-name" placeholder="First name or nickname" value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}
        <div>
          <label className="field-label">Email</label>
          <input className="field" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input className="field" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {isSignup && (
          <button type="button" className="toggle-row" onClick={() => setConsent(c => !c)} style={{ alignItems: 'flex-start', gap: 12, textAlign: 'left' }}>
            <span className={`checkbox ${consent ? 'on' : ''}`}>{consent ? '✓' : ''}</span>
            <span>
              <p className="v-card-title" style={{ fontSize: 14 }}>Help bring Vinna to life</p>
              <p className="v-body-sm" style={{ marginTop: 4 }}>
                Yes, send me Vinna's occasional product notes and early access, and use my sign-up to help shape what gets
                built. Change this any time in your account.
              </p>
            </span>
          </button>
        )}

        {msg && <p className="v-body-sm" style={{ color: 'var(--fg-warn)' }}>{msg}</p>}

        <Btn onClick={submit} disabled={busy || !ready}>
          {busy ? 'One moment…' : isSignup ? 'Create account →' : 'Sign in →'}
        </Btn>
        <Btn variant="secondary" onClick={magic} disabled={busy || !email || (isSignup && !ready)}>Email me a magic link</Btn>

        <button className="btn-ghost center" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--fg-3)', padding: '8px 0' }} onClick={() => { setMode(isSignup ? 'login' : 'signup'); setMsg(null) }}>
          {isSignup ? 'I already have an account' : 'Create an account instead'}
        </button>

        <div className="hr" />
        <Btn variant="ghost" onClick={continueAsGuest}>Skip to the demo tour →</Btn>
      </div>
    </div>
  )
}

/* ---------- product onboarding tour (illustrative) ---------- */
const steps = [
  {
    eyebrow: '01 / Basics',
    title: <>The app that<br /><span>grows with you.</span></>,
    body: 'Vinna meets you where you are, first cycle through perimenopause and beyond. Tell it a little, and every screen tunes itself to you.',
    detail: ['Your name and stage of life', 'Nothing clinical, nothing scary', 'You can change all of it later'],
  },
  {
    eyebrow: '02 / Your cycle',
    title: <>Track without<br /><span>the paywall.</span></>,
    body: 'Period and cycle tracking is always free. Vinna learns your phases so it can front-load the right food, rest and prompts on the right days.',
    detail: ['Period & cycle tracking', 'Phase-aware reminders', 'Screening nudges when they are due'],
  },
  {
    eyebrow: '03 / Connect apps',
    title: <>Reads your<br /><span>whole picture.</span></>,
    body: 'Connect Strava, Garmin, Peloton, Apple Health or Oura, read-only. When you plan a long ride, Vinna already knows.',
    detail: ['Strava · rides & runs', 'Oura · sleep & readiness', 'All read-only, you stay in control'],
  },
  {
    eyebrow: '04 / Sharing',
    title: <>You choose<br /><span>what they see.</span></>,
    body: 'Optionally invite a partner or care team, and pick exactly what they see, cycle phase, mood, symptoms, each an independent toggle.',
    detail: ['Partner sees only what you allow', 'Care team gets the summary, not the raw feed', 'Revoke any time'],
  },
]

function Tour({ step, onNext, onBack }: { step: number; onNext: () => void; onBack: () => void }) {
  const s = steps[step]
  return (
    <div className="auth-screen pad-top-safe">
      <div className="row between" style={{ marginBottom: 8 }}>
        <button className="icon-btn" onClick={onBack}>←</button>
        <div className="step-dots">{steps.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
      </div>

      <div className="grow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="reveal" key={step}>
          <Eyebrow>{s.eyebrow}</Eyebrow>
          <h1 className="v-h1" style={{ marginTop: 16 }}>{s.title}</h1>
          <p className="v-body" style={{ marginTop: 16, fontSize: 15 }}>{s.body}</p>
          <div className="card flat" style={{ marginTop: 22 }}>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 12 }}>
              {s.detail.map(d => (
                <li key={d} className="v-body-sm row" style={{ alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: 'var(--fg-accent)' }}>·</span><span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="stack-sm" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}>
        <Btn onClick={onNext}>{step >= 3 ? 'Enter Vinna →' : 'Continue →'}</Btn>
      </div>
    </div>
  )
}
