import { useState } from 'react'
import { useApp } from '../lib/store'
import { tiers } from '../lib/data'
import type { Tier } from '../lib/types'
import { Eyebrow, Btn } from './ui'

export function Paywall({ context, onClose }: { context?: string; onClose: () => void }) {
  const { setTier, profile } = useApp()
  const [choice, setChoice] = useState<Tier>('plus')

  return (
    <div className="stack">
      <Eyebrow>Vinna membership</Eyebrow>
      <h2 className="v-h2" style={{ lineHeight: 0.95 }}>
        Tracking is free.<br /><span style={{ color: 'var(--fg-accent)' }}>Understanding goes deeper.</span>
      </h2>
      <p className="v-body" style={{ marginTop: -4 }}>
        {context ?? 'Your tracking, sync and reminders are always free. Paid tiers unlock interpretation of your own data, the what, then the why.'}
      </p>

      <div className="stack-sm" style={{ marginTop: 4 }}>
        {tiers.map(t => {
          const on = choice === t.id
          const current = profile.tier === t.id
          return (
            <button
              key={t.id}
              onClick={() => setChoice(t.id)}
              className={`card ${on ? 'accent' : ''}`}
              style={{ textAlign: 'left', cursor: 'pointer', borderColor: on ? 'var(--tint-rust-border)' : undefined }}
            >
              <div className="row between">
                <span className="v-card-title">{t.name}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: on ? 'var(--fg-accent)' : 'var(--fg-1)', letterSpacing: 1 }}>
                  {t.price}<span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1 }}>{t.id === 'free' ? '' : '/MO'}</span>
                </span>
              </div>
              <p className="v-body-sm" style={{ margin: '6px 0 12px' }}>{t.line}</p>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 7 }}>
                {t.features.map(f => (
                  <li key={f} className="v-body-sm row" style={{ alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--fg-positive)', fontSize: 12, lineHeight: 1.5 }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {current && <div style={{ marginTop: 10 }}><span className="badge lichen">Current plan</span></div>}
            </button>
          )
        })}
      </div>

      <Btn onClick={() => { setTier(choice); onClose() }}>
        {choice === 'free' ? 'Stay on Free →' : `Unlock ${tiers.find(t => t.id === choice)?.name} →`}
      </Btn>
      <p className="v-meta center" style={{ marginTop: -4 }}>Cancel any time · No charge in this preview</p>
    </div>
  )
}
