import { useState } from 'react'
import { useApp } from '../lib/store'
import { Eyebrow, Badge, Btn, Sheet } from './ui'
import { shareAudiences, shareFields } from '../lib/data'
import type { ShareAudience } from '../lib/types'

const audienceLabel = (a: ShareAudience) => shareAudiences.find(x => x.key === a)?.label ?? a
const fieldLabel = (k: string) => shareFields.find(f => f.key === k)?.label ?? k

export function SharePlanCard({ toast }: { toast: (m: string) => void }) {
  const { shares } = useApp()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="card accent reveal d1"
        style={{ marginTop: 12, width: '100%', textAlign: 'left', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      >
        <div className="row between">
          <div>
            <p className="v-label" style={{ marginBottom: 6 }}>Share your plan</p>
            <p className="v-card-title" style={{ fontSize: 16 }}>
              {shares.length > 0 ? `Sharing with ${shares.length}` : 'Invite someone in'}
            </p>
          </div>
          <span style={{ color: 'var(--fg-accent)' }}>→</span>
        </div>
        <p className="v-body-sm" style={{ marginTop: 8 }}>
          Let a partner, loved one or care team see exactly what you choose. It should not always be on you to keep
          everyone posted.
        </p>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)}>
        <ShareFlow toast={toast} onDone={() => setOpen(false)} />
      </Sheet>
    </>
  )
}

function ShareFlow({ toast, onDone }: { toast: (m: string) => void; onDone: () => void }) {
  const { shares, addShare, removeShare } = useApp()
  const [audience, setAudience] = useState<ShareAudience | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [fields, setFields] = useState<string[]>([])

  function pickAudience(a: ShareAudience) {
    setAudience(a)
    setFields(shareAudiences.find(x => x.key === a)?.defaults ?? [])
  }
  function toggleField(k: string) {
    setFields(f => (f.includes(k) ? f.filter(x => x !== k) : [...f, k]))
  }
  function send() {
    if (!audience) return
    if (!email.trim()) { toast('Add their email to send the invite.'); return }
    if (fields.length === 0) { toast('Pick at least one thing to share.'); return }
    const who = name.trim() || audienceLabel(audience)
    addShare({ name: name.trim(), email: email.trim(), audience, fields })
    toast(`Invite sent to ${who}.`)
    setAudience(null); setName(''); setEmail(''); setFields([])
  }

  return (
    <>
      <Eyebrow>Share your plan</Eyebrow>
      <h2 className="v-h2" style={{ margin: '10px 0 6px' }}>Choose who, and what.</h2>
      <p className="v-meta" style={{ marginBottom: 18 }}>Sharing is optional and you can stop any time.</p>

      {/* already sharing with */}
      {shares.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <Eyebrow noRule>Sharing with</Eyebrow>
          <div className="stack-sm" style={{ marginTop: 12 }}>
            {shares.map(s => (
              <div key={s.id} className="card flat" style={{ padding: 14 }}>
                <div className="row between">
                  <div>
                    <p className="v-card-title" style={{ fontSize: 14 }}>{s.name || audienceLabel(s.audience)}</p>
                    <p className="v-meta" style={{ marginTop: 2 }}>{audienceLabel(s.audience)} · {s.email}</p>
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--fg-warn)' }}
                    onClick={() => { removeShare(s.id); toast('Sharing stopped.') }}
                  >
                    Stop
                  </button>
                </div>
                <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
                  {s.fields.map(f => <Badge key={f} tone="lichen">{fieldLabel(f)}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* pick audience */}
      <Eyebrow noRule>Invite someone new</Eyebrow>
      <div className="stack-sm" style={{ margin: '12px 0 4px' }}>
        {shareAudiences.map(a => (
          <button
            key={a.key}
            className={`card ${audience === a.key ? 'accent' : ''}`}
            style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
            onClick={() => pickAudience(a.key)}
          >
            <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--fg-accent)', lineHeight: 1.4 }}>{a.glyph}</span>
              <div className="grow">
                <div className="row between">
                  <span className="v-card-title" style={{ fontSize: 15 }}>{a.label}</span>
                  {audience === a.key && <Badge tone="rust" dot>Selected</Badge>}
                </div>
                <p className="v-body-sm" style={{ marginTop: 6 }}>{a.blurb}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* details + field picking, revealed once an audience is chosen */}
      {audience && (
        <div className="reveal" style={{ marginTop: 20 }}>
          <Eyebrow noRule>Their details</Eyebrow>
          <div className="stack-sm" style={{ margin: '12px 0 20px' }}>
            <input className="field" placeholder="Their name (optional)" value={name} onChange={e => setName(e.target.value)} />
            <input className="field" type="email" placeholder="Their email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <Eyebrow noRule>What {name.trim() || 'they'} can see</Eyebrow>
          <div className="stack-sm" style={{ marginTop: 12 }}>
            {shareFields.map(f => {
              const on = fields.includes(f.key)
              return (
                <button key={f.key} className="toggle-row" style={{ width: '100%' }} onClick={() => toggleField(f.key)}>
                  <div style={{ textAlign: 'left', paddingRight: 12 }}>
                    <p className="v-card-title" style={{ fontSize: 14 }}>{f.label}</p>
                    <p className="v-body-sm" style={{ marginTop: 4 }}>{f.desc}</p>
                  </div>
                  <span className={`switch ${on ? 'on' : ''}`} />
                </button>
              )
            })}
          </div>

          <div className="stack-sm" style={{ marginTop: 22 }}>
            <Btn onClick={send}>Send the invite →</Btn>
            <Btn variant="secondary" onClick={onDone}>Done</Btn>
          </div>
        </div>
      )}

      {!audience && (
        <div style={{ marginTop: 22 }}>
          <Btn variant="secondary" onClick={onDone}>Done</Btn>
        </div>
      )}
    </>
  )
}
