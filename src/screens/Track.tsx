import { useState } from 'react'
import { useApp } from '../lib/store'
import { TopBar } from '../components/TopBar'
import { Eyebrow, Badge, Btn } from '../components/ui'
import { patterns } from '../lib/data'

type Sub = 'recovery' | 'altitude' | 'insights'

const windows = [
  {
    when: 'Now', tone: 'rust' as const,
    items: [
      'Warm ginger oats, gentle on a cramp-y morning, steady carbs for later.',
      'Top up iron: a citrus glass with breakfast helps absorption on Day 1.',
    ],
  },
  {
    when: 'Midday', tone: 'ochre' as const,
    items: [
      'Iron-forward lunch, the beef & lentil bowl replenishes heavy-day stores.',
      'Keep movement easy. A short walk over a hard session today.',
    ],
  },
  {
    when: 'Evening', tone: 'lichen' as const,
    items: [
      'Magnesium glycinate to wind the legs down before the ride block.',
      'Tart cherry if you trained, traditionally used to support overnight recovery.',
    ],
  },
]

export function Track({ openPaywall }: { openPaywall: (ctx?: string) => void }) {
  const { profile } = useApp()
  const [sub, setSub] = useState<Sub>('recovery')
  const locked = profile.tier === 'free'

  return (
    <>
      <TopBar right={<button className="icon-btn" title="Connected apps">◍</button>} />
      <div className="scroll">
        <div className="screen">
          <div className="reveal" style={{ paddingTop: 22 }}>
            <Eyebrow>Track</Eyebrow>
            <h1 className="v-h1" style={{ marginTop: 12 }}>Recovery<br /><span>day.</span></h1>
            <p className="v-body" style={{ marginTop: 12 }}>Day {profile.cycleDay}, building toward your {profile.goal}. Today is about laying down recovery, not chasing it later.</p>
          </div>

          <div className="row wrap" style={{ gap: 8, marginTop: 20 }}>
            {(['recovery', 'altitude', 'insights'] as Sub[]).map(s => (
              <button key={s} className={`chip ${sub === s ? 'on' : ''}`} onClick={() => setSub(s)}>
                {s === 'recovery' ? 'Recovery' : s === 'altitude' ? 'Altitude + env' : 'Insights'}
              </button>
            ))}
          </div>

          {sub === 'recovery' && (
            <div className="reveal" style={{ marginTop: 20 }}>
              <div className="card flat">
                <p className="v-label" style={{ marginBottom: 8 }}>Why this today</p>
                <p className="v-body-sm">Front-loading rest beats a recovery scramble at 9pm. Each window is a small, doable thing, not a list you'll forget by noon.</p>
              </div>

              <div className="stack" style={{ marginTop: 16 }}>
                {windows.map(w => (
                  <div key={w.when} className={`card accent ${w.tone}`}>
                    <div className="row between">
                      <Eyebrow tone={w.tone}>{w.when}</Eyebrow>
                      <span className="v-meta">{w.when === 'Now' ? 'Up next' : ''}</span>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'grid', gap: 10, marginTop: 12 }}>
                      {w.items.map(it => (
                        <li key={it} className="v-body-sm row" style={{ alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ color: `var(--vinna-${w.tone})`, lineHeight: 1.5 }}>·</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sub === 'altitude' && (
            <div className="reveal stack" style={{ marginTop: 20 }}>
              <div className="card">
                <Eyebrow tone="ochre">● Altitude + environment</Eyebrow>
                <h3 className="v-h3" style={{ margin: '12px 0 8px' }}>Haleakalā · 3,055m summit</h3>
                <p className="v-body-sm">Thinner air raises perceived effort and quietly increases fluid loss. On Day 1 that stacks with lower iron, so the plan leans into easy pacing and steady hydration.</p>
                <div className="grid-2" style={{ marginTop: 16 }}>
                  <Stat k="Summit air" v="≈68% O₂" />
                  <Stat k="Hydration" v="+15–20%" />
                  <Stat k="Effort feel" v="Higher" />
                  <Stat k="Training base" v="Edmonton" />
                </div>
              </div>
              <div className="card flat">
                <p className="v-label" style={{ marginBottom: 8 }}>Edmonton today</p>
                <p className="v-body-sm">Dry, cool morning. Good for an easy spin to keep the legs turning without adding load.</p>
              </div>
            </div>
          )}

          {sub === 'insights' && (
            <div className="reveal stack" style={{ marginTop: 20 }}>
              {patterns.slice(0, locked ? 2 : patterns.length).map(p => (
                <PatternCard key={p.id} p={p} />
              ))}
              {locked && (
                <div className="card accent">
                  <Eyebrow>◆ More in Vinna+</Eyebrow>
                  <p className="v-body-sm" style={{ margin: '10px 0 14px' }}>Daily insight tuned to your phase reads your synced rides and surfaces patterns sooner.</p>
                  <Btn sm onClick={() => openPaywall('Daily phase-tuned insight is part of Vinna+.')}>See membership →</Btn>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="card flat" style={{ padding: 14 }}>
      <p className="v-meta">{k}</p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: 1, color: 'var(--fg-1)', marginTop: 4 }}>{v}</p>
    </div>
  )
}

export function PatternCard({ p }: { p: typeof patterns[number] }) {
  return (
    <div className={`card accent ${p.color === 'muted' ? '' : p.color}`}>
      <div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
        <div>
          <div className={`pattern-stat ${p.color}`}>{p.stat}</div>
          <p className="v-meta" style={{ marginTop: 2 }}>{p.statLabel}</p>
        </div>
        <div className="grow">
          <p className="v-card-title">{p.title}</p>
          <p className="v-body-sm" style={{ margin: '6px 0 10px' }}>{p.body}</p>
          <Badge tone={p.color === 'muted' ? 'rust' : p.color} dot={p.footer.startsWith('Auto')}>{p.footer}</Badge>
        </div>
      </div>
    </div>
  )
}
