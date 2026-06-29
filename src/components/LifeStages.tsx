import { useState } from 'react'
import { Eyebrow, Btn, Badge, Sheet } from './ui'
import { lifeStages } from '../lib/data'
import type { LifeStage } from '../lib/types'

/* A lightweight, illustrative preview that lets a tester flip through how Vinna
   adapts across life stages, plus an optional mental-health layer. It is a quick
   toggle to show the app is whole-life, not just for menstruating women. It does
   not change the live app, it only previews other stages. */

export function LifeStagesCard() {
  const [open, setOpen] = useState(false)
  const here = lifeStages.find(s => s.here) ?? lifeStages[0]

  return (
    <>
      <button
        className="card accent"
        style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
        onClick={() => setOpen(true)}
      >
        <div className="row between">
          <Eyebrow>● Vinna grows with you</Eyebrow>
          <Badge tone="lichen">Preview</Badge>
        </div>
        <h3 className="v-card-title" style={{ margin: '12px 0 6px', fontSize: 16 }}>
          Vinna is for a whole life, not just the cycling years.
        </h3>
        <p className="v-body-sm">
          You are in your {here.label.toLowerCase()}. Flip through how Vinna would look in pregnancy,
          postpartum, perimenopause and beyond, with a mental-health layer you can switch on.
        </p>
        <div className="ls-glyph-row" style={{ marginTop: 14 }}>
          {lifeStages.map(s => (
            <span key={s.id} className={`ls-glyph-pip ${s.here ? 'on' : ''}`} aria-hidden>
              {s.glyph}
            </span>
          ))}
        </div>
        <span className="v-meta" style={{ display: 'block', marginTop: 14, color: 'var(--fg-accent)' }}>
          Preview other life stages →
        </span>
      </button>

      <LifeStagesSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function LifeStagesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeId, setActiveId] = useState(lifeStages.find(s => s.here)?.id ?? lifeStages[0].id)
  const [mind, setMind] = useState(false)
  const stage = lifeStages.find(s => s.id === activeId) ?? lifeStages[0]

  return (
    <Sheet open={open} onClose={onClose}>
      <Eyebrow>● Vinna grows with you</Eyebrow>
      <h2 className="v-h2" style={{ margin: '10px 0 4px' }}>
        One app,<br /><span style={{ color: 'var(--fg-accent)' }}>every life stage.</span>
      </h2>
      <p className="v-body-sm" style={{ marginBottom: 16 }}>
        A preview of how Vinna re-tunes as life changes. In the app you stay in your own stage.
      </p>

      {/* stage selector */}
      <div className="row wrap" style={{ gap: 8 }}>
        {lifeStages.map(s => (
          <button
            key={s.id}
            className={`chip ${s.id === activeId ? 'on' : ''}`}
            onClick={() => setActiveId(s.id)}
          >
            <span style={{ marginRight: 6 }}>{s.glyph}</span>{s.label}{s.here ? ' · you' : ''}
          </button>
        ))}
      </div>

      <StagePreview stage={stage} mind={mind} />

      {/* mental-health layer toggle */}
      <button
        className={`chip ${mind ? 'lichen on' : ''}`}
        style={{ marginTop: 18 }}
        onClick={() => setMind(m => !m)}
      >
        <span style={{ marginRight: 6 }}>◐</span>
        Mental-health layer {mind ? 'on' : 'off'}
      </button>

      {mind && (
        <div className="card accent lichen reveal" style={{ marginTop: 12 }}>
          <Eyebrow tone="lichen">● Mind, this stage</Eyebrow>
          <p className="v-body-sm" style={{ margin: '12px 0 0' }}>{stage.mind.note}</p>
        </div>
      )}

      <p className="v-meta" style={{ margin: '20px 4px 4px', color: 'var(--fg-3)' }}>
        Illustrative preview · stages are not switchable in the app yet
      </p>
      <div style={{ marginTop: 14 }}>
        <Btn variant="secondary" onClick={onClose}>Close</Btn>
      </div>
    </Sheet>
  )
}

function StagePreview({ stage, mind }: { stage: LifeStage; mind: boolean }) {
  const R = 56, SW = 7, SIZE = (R + SW) * 2 + 4
  const cx = SIZE / 2
  const circ = 2 * Math.PI * R
  const pct = Math.min(Math.max(stage.ringPct, 0.02), 1)

  return (
    <div className="reveal" style={{ marginTop: 18 }}>
      <p className="v-quote center" style={{ margin: '0 8px 8px', color: 'var(--fg-2)' }}>
        {stage.tagline}
      </p>

      {/* mini ring marker */}
      <div className="ls-ring">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={cx} cy={cx} r={R} fill="none" stroke="var(--vinna-bark)" strokeWidth={SW} />
          <circle
            cx={cx} cy={cx} r={R} fill="none"
            stroke="var(--vinna-rust)" strokeWidth={SW} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            transform={`rotate(-90 ${cx} ${cx})`}
          />
        </svg>
        <div className="ls-center">
          <span className={`ls-glyph ${stage.positive ? 'lichen' : ''}`}>{stage.ringGlyph}</span>
          <span className="ls-big">{stage.marker}</span>
          <span className="ls-sub">{stage.markerSub}</span>
        </div>
      </div>

      <p className="v-body center" style={{ margin: '6px 12px 0', color: 'var(--fg-2)' }}>
        {stage.context}
      </p>

      {/* for you today, this stage */}
      <Eyebrow noRule>For you today</Eyebrow>
      <div className="fyt-grid" style={{ marginTop: 12 }}>
        {stage.trio.map((t, i) => (
          <div key={i} className={`fyt-tile ${t.tone ?? ''}`}>
            <span className="glyph">{t.glyph}</span>
            <span className="lbl">{t.lbl}</span>
            <span className="ttl">{t.ttl}</span>
          </div>
        ))}
        {mind && (
          <div className="fyt-tile lichen reveal">
            <span className="glyph">{stage.mind.tile.glyph}</span>
            <span className="lbl">{stage.mind.tile.lbl}</span>
            <span className="ttl">{stage.mind.tile.ttl}</span>
          </div>
        )}
      </div>

      <div className="card flat" style={{ marginTop: 16 }}>
        <p className="v-label" style={{ marginBottom: 8 }}>What Vinna leans into</p>
        <p className="v-body-sm">{stage.focus}</p>
      </div>
    </div>
  )
}
