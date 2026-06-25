import { useState } from 'react'
import { useApp } from '../lib/store'
import { Eyebrow, Badge, Btn, Sheet } from './ui'
import { ferritinInsight, ironProviders } from '../lib/data'

const INFO_ID = 'ferritin-iron-infusion'

export function FerritinInsightSheet({ open, onClose, toast }: { open: boolean; onClose: () => void; toast: (m: string) => void }) {
  const { toggleSave, isSaved, addAppointmentNote, profile } = useApp()
  const [showProviders, setShowProviders] = useState(false)
  const saved = isSaved(INFO_ID)

  function saveToAppointment() {
    addAppointmentNote({
      source: 'insight',
      title: 'Ask about ferritin testing',
      body:
        'Vinna flagged stronger low energy on Days 1 to 2 across recent cycles. Ask about a ferritin (iron stores) test, and if it is low, ask whether a publicly covered iron infusion is an option here.',
    })
    toast('Saved to your appointment notes.')
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <Eyebrow tone="ochre">● Health intelligence</Eyebrow>
      <h2 className="v-h2" style={{ margin: '10px 0 6px' }}>Worth asking about:<br /><span style={{ color: 'var(--fg-accent)' }}>ferritin.</span></h2>
      <p className="v-meta" style={{ marginBottom: 18 }}>An idea to raise, not a diagnosis.</p>

      {/* what we noticed */}
      <div className="card flat">
        <p className="v-label" style={{ marginBottom: 8 }}>What we noticed</p>
        <p className="v-body-sm">{ferritinInsight.pattern}</p>
      </div>

      {/* why ferritin */}
      <div className="card accent" style={{ marginTop: 14 }}>
        <p className="v-label" style={{ marginBottom: 8 }}>Why ferritin</p>
        <p className="v-body-sm">{ferritinInsight.whyFerritin}</p>
      </div>

      {/* if it comes back low, more than supplements */}
      <div className="card accent ochre" style={{ marginTop: 14 }}>
        <div className="row between">
          <p className="v-label">If it comes back low</p>
          <Badge tone="ochre">More than supplements</Badge>
        </div>
        <p className="v-body-sm" style={{ marginTop: 10 }}>{ferritinInsight.ifLow}</p>
      </div>

      {/* providers near me */}
      <div style={{ marginTop: 16 }}>
        {!showProviders ? (
          <Btn variant="secondary" onClick={() => setShowProviders(true)}>Find iron clinics near me →</Btn>
        ) : (
          <div className="reveal">
            <Eyebrow noRule>Near {profile.city}</Eyebrow>
            <div className="stack-sm" style={{ marginTop: 12 }}>
              {ironProviders.map(p => (
                <div key={p.id} className="card flat" style={{ padding: 14 }}>
                  <div className="row between">
                    <span className="v-card-title" style={{ fontSize: 14 }}>{p.name}</span>
                    <span className="v-meta">{p.distance}</span>
                  </div>
                  <p className="v-body-sm" style={{ margin: '6px 0 10px' }}>{p.note}</p>
                  <div className="row" style={{ gap: 6 }}>
                    <Badge tone="rust">{p.type}</Badge>
                    {p.covered && <Badge tone="lichen" dot>May be covered</Badge>}
                  </div>
                </div>
              ))}
            </div>
            <p className="v-meta" style={{ marginTop: 10 }}>Listings are illustrative in this demo.</p>
          </div>
        )}
      </div>

      {/* actions */}
      <div className="stack-sm" style={{ marginTop: 20 }}>
        <Btn onClick={saveToAppointment}>Save to my appointment →</Btn>
        <Btn
          variant="secondary"
          onClick={() => { toggleSave(INFO_ID, 'fact'); toast(saved ? 'Removed from Saved.' : 'Saved to You → Saved.') }}
        >
          {saved ? '★ Saved' : '♥ Save this info'}
        </Btn>
      </div>

      <p className="v-meta" style={{ margin: '18px 4px 0' }}>{ferritinInsight.caution}</p>
    </Sheet>
  )
}
