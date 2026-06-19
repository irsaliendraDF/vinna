import { useState } from 'react'
import { useApp } from '../lib/store'
import { TopBar } from '../components/TopBar'
import { Eyebrow, Badge, Btn, Sheet } from '../components/ui'
import { FeedbackSheet, FeedbackAutoPrompt } from '../components/Feedback'
import { PatternCard } from './Track'
import { herbs, recipes, patterns, moodMeta } from '../lib/data'

type Sub = 'history' | 'saved' | 'patterns'

const tierName = { free: 'Vinna Free', plus: 'Vinna+', deep: 'Vinna Deep' } as const
const relTime = (iso: string) => {
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 864e5)
  return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`
}
const titleFor = (id: string) => herbs.find(h => h.id === id)?.name ?? recipes.find(r => r.id === id)?.title ?? id

export function You({ openPaywall, toast }: { openPaywall: (ctx?: string) => void; toast: (m: string) => void }) {
  const { profile, logs, feelChecks, saves } = useApp()
  const [sub, setSub] = useState<Sub>('history')
  const [hist, setHist] = useState<'all' | 'recipe' | 'herb' | 'symptom'>('all')
  const [pat, setPat] = useState<'all' | 'energy' | 'nutrition' | 'cycle' | 'sleep'>('all')
  const [settings, setSettings] = useState(false)
  const [feedback, setFeedback] = useState(false)

  // merged history feed
  const feed = [
    ...logs.map(l => ({ kind: l.itemKind as string, when: l.createdAt, title: l.itemTitle, sub: `Logged · Day ${l.cycleDay}`, ratings: l.ratings })),
    ...feelChecks.map(f => ({ kind: 'symptom', when: f.createdAt, title: `Feel check · ${moodMeta[f.mood].label}`, sub: f.symptoms.join(' · ') || `Day ${f.cycleDay}`, ratings: undefined as undefined | Record<string, string> })),
  ].sort((a, b) => +new Date(b.when) - +new Date(a.when))
  const feedFiltered = hist === 'all' ? feed : feed.filter(f => f.kind === hist)
  const patFiltered = pat === 'all' ? patterns : patterns.filter(p => p.cat === pat)

  return (
    <>
      <TopBar right={<button className="icon-btn" title="Settings" onClick={() => setSettings(true)}>⚙</button>} />
      <div className="scroll">
        <div className="screen">
          <div className="reveal" style={{ paddingTop: 22 }}>
            <Eyebrow>You</Eyebrow>
            <h1 className="v-h1" style={{ marginTop: 12 }}>{profile.name}</h1>
            <p className="v-body" style={{ marginTop: 8 }}>{profile.city} · Day {profile.cycleDay} · {profile.phase.toLowerCase()} phase</p>
          </div>

          <div className="card accent reveal d1" style={{ marginTop: 20 }}>
            <div className="row between">
              <div>
                <p className="v-label" style={{ marginBottom: 6 }}>Membership</p>
                <p className="v-card-title" style={{ fontSize: 18 }}>{tierName[profile.tier]}</p>
              </div>
              <Btn sm variant="secondary" onClick={() => openPaywall()}>{profile.tier === 'free' ? 'Upgrade →' : 'Manage →'}</Btn>
            </div>
          </div>

          <button className="card reveal d1" style={{ marginTop: 12, width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={() => setSettings(true)}>
            <div className="row between">
              <div>
                <p className="v-label" style={{ marginBottom: 6 }}>Account</p>
                <p className="v-card-title" style={{ fontSize: 16 }}>Account & settings</p>
              </div>
              <span style={{ color: 'var(--fg-3)' }}>→</span>
            </div>
            <p className="v-body-sm" style={{ marginTop: 8 }}>Login & security, privacy, sharing, connected apps, communications, and your data.</p>
          </button>

          <button className="card accent reveal d1" style={{ marginTop: 12, width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={() => setFeedback(true)}>
            <div className="row between">
              <div>
                <p className="v-label" style={{ marginBottom: 6 }}>Help shape Vinna</p>
                <p className="v-card-title" style={{ fontSize: 16 }}>Share feedback</p>
              </div>
              <span style={{ color: 'var(--fg-accent)' }}>→</span>
            </div>
            <p className="v-body-sm" style={{ marginTop: 8 }}>You are an early tester. Tell us what is working and what you would change.</p>
          </button>

          <div className="row wrap" style={{ gap: 8, marginTop: 20 }}>
            {(['history', 'saved', 'patterns'] as Sub[]).map(s => (
              <button key={s} className={`chip ${sub === s ? 'on' : ''}`} onClick={() => setSub(s)}>
                {s === 'history' ? 'History' : s === 'saved' ? 'Saved' : 'Patterns'}
              </button>
            ))}
          </div>

          {sub === 'history' && (
            <div className="reveal" style={{ marginTop: 16 }}>
              <div className="row wrap" style={{ gap: 8, marginBottom: 16 }}>
                {(['all', 'recipe', 'herb', 'symptom'] as const).map(f => (
                  <button key={f} className={`chip ${hist === f ? 'on' : ''}`} onClick={() => setHist(f)}>
                    {f === 'all' ? 'All' : f === 'recipe' ? 'Recipes' : f === 'herb' ? 'Herbs' : 'Symptoms'}
                  </button>
                ))}
              </div>
              <div className="stack-sm">
                {feedFiltered.map((f, i) => (
                  <div key={i} className="card flat" style={{ padding: 16 }}>
                    <div className="row between">
                      <span className="v-card-title" style={{ fontSize: 14 }}>{f.title}</span>
                      <span className="v-meta">{relTime(f.when)}</span>
                    </div>
                    <p className="v-body-sm" style={{ marginTop: 4 }}>{f.sub}</p>
                    {f.ratings && Object.keys(f.ratings).length > 0 && (
                      <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
                        {Object.entries(f.ratings).map(([k, v]) => (
                          <Badge key={k} tone={v === 'yes' ? 'lichen' : v === 'some' ? 'ochre' : 'rust'}>{k}: {v}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {feedFiltered.length === 0 && <Empty />}
              </div>
            </div>
          )}

          {sub === 'saved' && (
            <div className="reveal" style={{ marginTop: 16 }}>
              <p className="v-meta" style={{ marginBottom: 14 }}>Your wishlist, things to come back to.</p>
              {saves.length === 0 ? <Empty /> : (
                <div className="grid-2">
                  {saves.map(s => (
                    <div key={s.id} className="card" style={{ padding: 16 }}>
                      <span style={{ color: 'var(--fg-accent)', fontSize: 18 }}>★</span>
                      <p className="v-card-title" style={{ fontSize: 14, margin: '10px 0 4px' }}>{titleFor(s.itemId)}</p>
                      <p className="v-meta">{s.itemKind}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {sub === 'patterns' && (
            <div className="reveal" style={{ marginTop: 16 }}>
              <div className="row wrap" style={{ gap: 8, marginBottom: 16 }}>
                {(['all', 'energy', 'nutrition', 'cycle', 'sleep'] as const).map(f => (
                  <button key={f} className={`chip ${pat === f ? 'on' : ''}`} onClick={() => setPat(f)}>
                    {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="stack">
                {patFiltered.map(p => <PatternCard key={p.id} p={p} />)}
                {patFiltered.length === 0 && <Empty />}
              </div>
            </div>
          )}
        </div>
      </div>

      <Sheet open={settings} onClose={() => setSettings(false)}>
        <AccountSettings onClose={() => setSettings(false)} toast={toast} />
      </Sheet>

      <FeedbackSheet open={feedback} onClose={() => setFeedback(false)} toast={toast} />

      {/* auto-opens 3s after the You tab loads, once per session */}
      <FeedbackAutoPrompt slot="you" toast={toast} />
    </>
  )
}

function AccountSettings({ onClose, toast }: { onClose: () => void; toast: (m: string) => void }) {
  const { user, profile, consent, setConsent, updateEmail, updatePassword, deleteAccount, signOut } = useApp()
  const [editEmail, setEditEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [editPw, setEditPw] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const guest = user?.isDemo

  async function saveEmail() {
    if (!newEmail) return
    setBusy(true)
    const err = await updateEmail(newEmail)
    setBusy(false)
    if (err) { toast(err); return }
    setEditEmail(false); setNewEmail('')
    toast(guest ? 'Email changes need a real account.' : 'Confirmation sent to your new email.')
  }
  async function savePw() {
    if (newPw.length < 6) { toast('Use at least 6 characters.'); return }
    setBusy(true)
    const err = await updatePassword(newPw)
    setBusy(false)
    if (err) { toast(err); return }
    setEditPw(false); setNewPw('')
    toast(guest ? 'Password changes need a real account.' : 'Password updated.')
  }
  function exportData() {
    try {
      const blob = new Blob([localStorage.getItem(`vinna_state_${user?.id}`) ?? '{}'], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = 'vinna-my-data.json'; a.click()
      toast('Your data is downloading.')
    } catch { toast('Could not export right now.') }
  }

  return (
    <>
      <Eyebrow>Account & settings</Eyebrow>
      <h2 className="v-h2" style={{ margin: '10px 0 6px' }}>Your account</h2>
      <p className="v-meta" style={{ marginBottom: 20 }}>Signed in as {user?.email}{guest ? ' (guest)' : ''}</p>

      {/* Login & security */}
      <p className="v-label" style={{ marginBottom: 12 }}>Login & security</p>
      <div className="stack-sm">
        <div className="card flat" style={{ padding: 16 }}>
          <div className="row between">
            <div><p className="v-card-title" style={{ fontSize: 14 }}>Email</p><p className="v-meta" style={{ marginTop: 2 }}>{user?.email}</p></div>
            <Btn sm variant="ghost" onClick={() => setEditEmail(v => !v)}>{editEmail ? 'Cancel' : 'Change'}</Btn>
          </div>
          {editEmail && (
            <div className="stack-sm" style={{ marginTop: 12 }}>
              <input className="field" type="email" placeholder="new@email.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              <Btn sm onClick={saveEmail} disabled={busy || !newEmail}>Save email →</Btn>
            </div>
          )}
        </div>
        <div className="card flat" style={{ padding: 16 }}>
          <div className="row between">
            <div><p className="v-card-title" style={{ fontSize: 14 }}>Password</p><p className="v-meta" style={{ marginTop: 2 }}>••••••••</p></div>
            <Btn sm variant="ghost" onClick={() => setEditPw(v => !v)}>{editPw ? 'Cancel' : 'Change'}</Btn>
          </div>
          {editPw && (
            <div className="stack-sm" style={{ marginTop: 12 }}>
              <input className="field" type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} />
              <Btn sm onClick={savePw} disabled={busy || !newPw}>Save password →</Btn>
            </div>
          )}
        </div>
      </div>

      {/* Communications & consent */}
      <p className="v-label" style={{ margin: '24px 0 12px' }}>Communications</p>
      <button className="toggle-row" onClick={() => setConsent(!consent)} style={{ width: '100%' }}>
        <div style={{ textAlign: 'left', paddingRight: 12 }}>
          <p className="v-card-title" style={{ fontSize: 14 }}>Product notes & early access</p>
          <p className="v-body-sm" style={{ marginTop: 4 }}>Occasional updates that help shape what Vinna builds. Turn off any time.</p>
        </div>
        <span className={`switch ${consent ? 'on' : ''}`} />
      </button>

      {/* Privacy & sharing */}
      <p className="v-label" style={{ margin: '24px 0 12px' }}>Privacy & sharing</p>
      <p className="v-body-sm" style={{ marginBottom: 12 }}>Choose exactly what a partner or care team sees. Each is independent.</p>
      <div className="stack-sm">
        <ToggleRow label="Cycle phase" desc="Partner" on />
        <ToggleRow label="Mood" desc="Partner" on />
        <ToggleRow label="Symptoms" desc="Care team" />
        <ToggleRow label="Health intelligence" desc="Care team" on />
      </div>

      {/* Connected apps */}
      <p className="v-label" style={{ margin: '24px 0 12px' }}>Connected apps</p>
      <div className="stack-sm">
        <ToggleRow label="Strava" desc="Read-only · rides & runs" on />
        <ToggleRow label="Oura" desc="Read-only · sleep & readiness" on />
        <ToggleRow label="Apple Health" desc="Read-only" />
        <ToggleRow label="Calendar" desc="Reminders & screening nudges" on />
      </div>

      {/* Your data */}
      <p className="v-label" style={{ margin: '24px 0 12px' }}>Your data</p>
      <div className="stack-sm">
        <Btn variant="secondary" onClick={exportData}>Download my data</Btn>
        {!confirmDelete ? (
          <button className="btn btn-ghost" style={{ color: 'var(--fg-warn)' }} onClick={() => setConfirmDelete(true)}>Delete my account</button>
        ) : (
          <div className="card accent ochre">
            <Eyebrow tone="ochre">⚠ This cannot be undone</Eyebrow>
            <p className="v-body-sm" style={{ margin: '10px 0 14px' }}>
              This removes your check-ins, logs and saved items, and signs you out. Vinna keeps nothing it does not need.
            </p>
            <div className="grid-2">
              <Btn sm variant="secondary" onClick={() => setConfirmDelete(false)}>Keep my account</Btn>
              <button className="btn btn-primary sm" onClick={async () => { await deleteAccount(); onClose(); toast('Your account and data were removed.') }}>Delete</button>
            </div>
          </div>
        )}
      </div>

      <div className="hr" style={{ margin: '24px 0' }} />
      <Btn variant="secondary" onClick={async () => { await signOut(); onClose(); toast('Signed out.') }}>Sign out</Btn>
    </>
  )
}

function ToggleRow({ label, desc, on = false }: { label: string; desc: string; on?: boolean }) {
  const [v, setV] = useState(on)
  return (
    <button className="toggle-row" onClick={() => setV(x => !x)} style={{ width: '100%' }}>
      <div style={{ textAlign: 'left' }}>
        <p className="v-card-title" style={{ fontSize: 14 }}>{label}</p>
        <p className="v-meta" style={{ marginTop: 2 }}>{desc}</p>
      </div>
      <span className={`switch ${v ? 'on' : ''}`} />
    </button>
  )
}

function Empty() {
  return (
    <div className="card flat center" style={{ padding: 28 }}>
      <p className="v-quote" style={{ color: 'var(--fg-3)' }}>Nothing here yet.</p>
      <p className="v-body-sm" style={{ marginTop: 8 }}>Track a little and Vinna will start to fill this in.</p>
    </div>
  )
}
