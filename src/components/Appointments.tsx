import { useState } from 'react'
import { useApp } from '../lib/store'
import { Eyebrow, Badge, Btn, Sheet } from './ui'

const sourceLabel = { insight: 'From an insight', journal: 'From your journal', manual: 'Added by you' } as const

export function AppointmentNotesCard({ toast }: { toast: (m: string) => void }) {
  const { appointmentNotes, removeAppointmentNote, addAppointmentNote } = useApp()
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')

  function addManual() {
    if (!text.trim()) { toast('Write something to bring up first.'); return }
    addAppointmentNote({ source: 'manual', title: 'Note for my appointment', body: text.trim() })
    setText(''); setAdding(false)
    toast('Added to your appointment notes.')
  }

  return (
    <>
      <button
        className="card reveal d1"
        style={{ marginTop: 12, width: '100%', textAlign: 'left', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      >
        <div className="row between">
          <div>
            <p className="v-label" style={{ marginBottom: 6 }}>Appointment notes</p>
            <p className="v-card-title" style={{ fontSize: 16 }}>
              {appointmentNotes.length > 0 ? `${appointmentNotes.length} to bring up` : 'Nothing saved yet'}
            </p>
          </div>
          <span style={{ color: 'var(--fg-3)' }}>→</span>
        </div>
        <p className="v-body-sm" style={{ marginTop: 8 }}>
          The things worth raising with your doctor, gathered in one place so you do not have to remember them in the room.
        </p>
      </button>

      <Sheet open={open} onClose={() => { setOpen(false); setAdding(false) }}>
        <Eyebrow>Appointment notes</Eyebrow>
        <h2 className="v-h2" style={{ margin: '10px 0 6px' }}>For your next visit</h2>
        <p className="v-meta" style={{ marginBottom: 18 }}>Saved from insights, your journal, or added by hand.</p>

        {appointmentNotes.length === 0 ? (
          <div className="card flat center" style={{ padding: 24 }}>
            <p className="v-body-sm">Nothing here yet. Save an insight or a journal entry, or add a note below.</p>
          </div>
        ) : (
          <div className="stack-sm">
            {appointmentNotes.map(n => (
              <div key={n.id} className="card flat" style={{ padding: 16 }}>
                <div className="row between">
                  <Badge tone={n.source === 'insight' ? 'ochre' : n.source === 'journal' ? 'lichen' : 'rust'}>
                    {sourceLabel[n.source]}
                  </Badge>
                  <button
                    className="btn-ghost"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--fg-warn)' }}
                    onClick={() => { removeAppointmentNote(n.id); toast('Removed.') }}
                  >
                    Remove
                  </button>
                </div>
                <p className="v-card-title" style={{ fontSize: 14, margin: '10px 0 4px' }}>{n.title}</p>
                <p className="v-body-sm">{n.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* add a note by hand */}
        <div style={{ marginTop: 18 }}>
          {!adding ? (
            <Btn variant="secondary" onClick={() => setAdding(true)}>+ Add a note</Btn>
          ) : (
            <div className="reveal stack-sm">
              <textarea
                className="field"
                style={{ minHeight: 90, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="Something to bring up…"
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <div className="grid-2">
                <Btn variant="secondary" onClick={() => { setAdding(false); setText('') }}>Cancel</Btn>
                <Btn onClick={addManual}>Add →</Btn>
              </div>
            </div>
          )}
        </div>

        {appointmentNotes.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Btn variant="secondary" onClick={() => toast('A doctor-ready PDF is coming soon.')}>
              Prepare a PDF for my doctor
            </Btn>
          </div>
        )}
      </Sheet>
    </>
  )
}
