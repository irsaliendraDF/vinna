import { useState } from 'react'
import { useApp } from '../lib/store'
import { TopBar } from '../components/TopBar'
import { FeelCheck } from '../components/FeelCheck'
import { Eyebrow, Btn, Badge, Sheet } from '../components/ui'
import { symptomSets } from '../lib/data'
import type { Mood } from '../lib/types'

const today = new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })

export function Today({ openPaywall, toast }: { openPaywall: (ctx?: string) => void; toast: (m: string) => void }) {
  const { profile, addFeelCheck } = useApp()
  const [rideOpen, setRideOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [nudgeDismissed, setNudgeDismissed] = useState(false)
  const locked = profile.tier === 'free'

  return (
    <>
      <TopBar right={<button className="icon-btn" title="Reminders">◔</button>} />
      <div className="scroll">
        <div className="screen">
          <div className="reveal" style={{ paddingTop: 22 }}>
            <Eyebrow noRule>{today}</Eyebrow>
            <h1 className="v-h1" style={{ marginTop: 12 }}>
              Good morning,<br /><span>{profile.name}.</span>
            </h1>
          </div>

          {/* cycle status */}
          <div className="card accent reveal d1" style={{ marginTop: 22 }}>
            <div className="row between">
              <Eyebrow>Cycle · Day {profile.cycleDay}</Eyebrow>
              <Badge tone="rust" dot>{profile.phase}</Badge>
            </div>
            <p className="v-body" style={{ marginTop: 12 }}>
              You're on day {profile.cycleDay} of your cycle — the menstrual phase. Energy often sits low here and that
              is your body doing exactly what it should. Vinna has front-loaded rest and iron-forward food today.
            </p>
          </div>

          {/* feel check */}
          <div className="reveal d2" style={{ marginTop: 16 }}>
            <FeelCheck
              onDetailed={() => setDetailOpen(true)}
              onDone={() => toast('Check-in saved. Your day just re-tuned.')}
            />
          </div>

          {/* ride prep — synced */}
          <div className="card reveal d3" style={{ marginTop: 16 }}>
            <div className="row between">
              <Eyebrow tone="ochre">● Synced from Strava</Eyebrow>
              <span className="v-meta">Planned · today</span>
            </div>
            <h3 className="v-h3" style={{ margin: '12px 0 4px' }}>Ride prep — {profile.goal}</h3>
            <p className="v-body-sm">
              80km, 2,400m of climbing, finishing at altitude. On Day 1 your fuelling and pacing want a small adjustment.
            </p>
            <div style={{ marginTop: 16 }}>
              <Btn variant="secondary" onClick={() => setRideOpen(true)}>Tap for full guide →</Btn>
            </div>
          </div>

          {/* health intelligence nudge */}
          {!nudgeDismissed && (
            <div className="card accent ochre reveal d4" style={{ marginTop: 16 }}>
              <Eyebrow tone="ochre">● Pattern detected</Eyebrow>
              <h3 className="v-card-title" style={{ margin: '12px 0 6px', fontSize: 16 }}>
                Worth raising at your next appointment
              </h3>
              <p className="v-body-sm">
                Across your last few cycles your check-ins show stronger Day 1 fatigue than the months before. It is not
                a diagnosis — just something a clinician might want to know. Vinna can prepare a short summary you can bring.
              </p>
              <div className="row" style={{ marginTop: 16, gap: 10 }}>
                <Btn sm variant="primary" onClick={() => toast('Summary saved to You → Health intelligence.')}>Prepare summary →</Btn>
                <Btn sm variant="ghost" onClick={() => setNudgeDismissed(true)}>Not relevant for me</Btn>
              </div>
            </div>
          )}

          <p className="v-quote center" style={{ margin: '40px 8px 8px', color: 'var(--fg-3)' }}>
            The app that grows with you.
          </p>
        </div>
      </div>

      {/* ride fuelling guide */}
      <Sheet open={rideOpen} onClose={() => setRideOpen(false)}>
        <Eyebrow>Ride fuelling guide</Eyebrow>
        <h2 className="v-h2" style={{ margin: '10px 0 4px' }}>Fuel for 80km<br /><span style={{ color: 'var(--fg-accent)' }}>at altitude.</span></h2>
        <div className="card flat" style={{ marginTop: 16 }}>
          <p className="v-label" style={{ marginBottom: 8 }}>Why this today</p>
          <p className="v-body-sm">
            You're on Day 1 and climbing to altitude. Iron demand is higher this week and thinner air raises your
            perceived effort. The aim is steady carbs and a gentle start, not a fast one.
          </p>
        </div>

        <div className="stack-sm" style={{ marginTop: 16 }}>
          <Row k="Before" v="A slow-carb breakfast 2–3h out. Hydrate with electrolytes." />
          <Row k="Free headline" v="Keep the first 20km easy — let your legs find the day before you push the climb." />
        </div>

        {locked ? (
          <div style={{ position: 'relative', marginTop: 18 }}>
            <div className="card teaser-blur">
              <p className="v-label" style={{ marginBottom: 10 }}>Phase-timed fuelling · Vinna+</p>
              <p className="v-body-sm">Carbs per hour by climb segment, the exact beetroot timing for your start, and the herbal recovery stack matched to a Day 1 effort — tuned to how you checked in this morning.</p>
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 20 }}>
              <div className="center stack-sm">
                <Badge tone="rust">◆ Vinna+ insight</Badge>
                <p className="v-body-sm" style={{ maxWidth: 240 }}>Unlock the full fuelling and recovery plan for this ride.</p>
                <Btn sm onClick={() => { setRideOpen(false); openPaywall('This is a Vinna+ insight — activity-aware fuelling and herbal guidance for your synced ride.') }}>
                  Unlock guide →
                </Btn>
              </div>
            </div>
          </div>
        ) : (
          <div className="card accent lichen" style={{ marginTop: 18 }}>
            <p className="v-label" style={{ marginBottom: 10 }}>Phase-timed fuelling · unlocked</p>
            <div className="stack-sm">
              <Row k="0–25km" v="60g carb/hour, mostly liquid. Sip, don't gulp." />
              <Row k="Climb" v="Drop to 45g/hour, add a pinch of salt. Beetroot taken 2.5h before the start." />
              <Row k="Recovery" v="Tart cherry + protein within the hour. Magnesium tonight for the legs." />
            </div>
          </div>
        )}
        <div style={{ marginTop: 18 }}><Btn variant="secondary" onClick={() => setRideOpen(false)}>Close</Btn></div>
      </Sheet>

      {/* detailed symptom logger */}
      <DetailedSymptom open={detailOpen} onClose={() => setDetailOpen(false)} onSave={(s) => { addFeelCheck('pain', [s.symptom], `${s.severity} · ${s.time}`); setDetailOpen(false); toast('Symptom logged.') }} />
    </>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
      <span className="v-label" style={{ minWidth: 78, paddingTop: 2 }}>{k}</span>
      <span className="v-body-sm grow">{v}</span>
    </div>
  )
}

function DetailedSymptom({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (s: { symptom: string; severity: string; time: string }) => void }) {
  const [symptom, setSymptom] = useState('Cramps')
  const [severity, setSeverity] = useState('Moderate')
  const [time, setTime] = useState('Morning')
  return (
    <Sheet open={open} onClose={onClose}>
      <Eyebrow>Detailed symptom</Eyebrow>
      <h2 className="v-h2" style={{ margin: '10px 0 16px' }}>Log a symptom</h2>
      <div className="stack">
        <Picker label="Symptom" value={symptom} setValue={setSymptom} options={symptomSets.negative} />
        <Picker label="Severity" value={severity} setValue={setSeverity} options={['Mild', 'Moderate', 'Strong']} />
        <Picker label="Time" value={time} setValue={setTime} options={['Morning', 'Midday', 'Evening', 'Overnight']} />
      </div>
      <div style={{ marginTop: 20 }}><Btn onClick={() => onSave({ symptom, severity, time })}>Save symptom →</Btn></div>
    </Sheet>
  )
}

function Picker({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: string[] }) {
  return (
    <div>
      <p className="v-label" style={{ marginBottom: 10 }}>{label}</p>
      <div className="row wrap" style={{ gap: 8 }}>
        {options.map(o => (
          <button key={o} className={`chip ${value === o ? 'on' : ''}`} onClick={() => setValue(o)}>{o}</button>
        ))}
      </div>
    </div>
  )
}
