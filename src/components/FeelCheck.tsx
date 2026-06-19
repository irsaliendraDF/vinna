import { useState } from 'react'
import { useApp } from '../lib/store'
import { moodMeta, symptomSets } from '../lib/data'
import type { Mood } from '../lib/types'
import { Eyebrow } from './ui'

const MOODS = Object.keys(moodMeta) as Mood[]

export function FeelCheck({ onDetailed, onDone }: { onDetailed: () => void; onDone: (mood: Mood) => void }) {
  const { addFeelCheck, feelChecks } = useApp()
  const [mood, setMood] = useState<Mood | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  const todayChecked = feelChecks.some(f => new Date(f.createdAt).toDateString() === new Date().toDateString()) && !saved

  if (saved || todayChecked) {
    const last = saved ? mood : feelChecks[0]?.mood
    return (
      <div className="card accent lichen reveal">
        <Eyebrow tone="lichen">● Checked in</Eyebrow>
        <p className="v-body" style={{ marginTop: 10 }}>
          Logged as <strong style={{ color: 'var(--fg-1)' }}>{last ? moodMeta[last].label.toLowerCase() : 'noted'}</strong> today.
          Everything below is tuned to how you feel. You can update it any time.
        </p>
      </div>
    )
  }

  const positive = mood ? moodMeta[mood].positive : false
  const chips = positive ? symptomSets.positive : symptomSets.negative

  function toggle(s: string) {
    setPicked(p => (p.includes(s) ? p.filter(x => x !== s) : [...p, s]))
  }
  function commit() {
    if (!mood) return
    addFeelCheck(mood, picked)
    setSaved(true)
    onDone(mood)
  }

  return (
    <div className="card">
      <Eyebrow>Feel check</Eyebrow>
      <h3 className="v-h3" style={{ margin: '10px 0 4px' }}>How are you, really?</h3>
      <p className="v-body-sm" style={{ marginBottom: 16 }}>One tap. This shapes your day, it never blocks it.</p>

      <div className="feel-grid">
        {MOODS.map(m => (
          <button
            key={m}
            className={`feel ${mood === m ? 'on' : ''} ${mood === m && moodMeta[m].positive ? 'lichen' : ''}`}
            onClick={() => { setMood(m); setPicked([]) }}
          >
            <span className="glyph">{moodMeta[m].glyph}</span>
            <span className="lbl">{moodMeta[m].label}</span>
          </button>
        ))}
      </div>

      {mood && (
        <div className="reveal" style={{ marginTop: 18 }}>
          <p className="v-label" style={{ marginBottom: 10 }}>
            {positive ? "What's contributing?" : 'Anything going on?'}
          </p>
          <div className="row wrap" style={{ gap: 8 }}>
            {chips.map(s => (
              <button
                key={s}
                className={`chip ${positive ? 'lichen' : ''} ${picked.includes(s) ? 'on' : ''}`}
                onClick={() => toggle(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <button className="btn-ghost" style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--fg-accent)' }} onClick={onDetailed}>
            + Add a detailed symptom
          </button>

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={commit}>Save check-in →</button>
          </div>
        </div>
      )}
    </div>
  )
}
