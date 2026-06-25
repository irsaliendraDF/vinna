import { useEffect, useRef, useState } from 'react'
import { useApp } from '../lib/store'
import { Eyebrow, Btn, Badge, Sheet } from './ui'

/* Lightweight extractive summary so "Summarize with Vinna" works offline in the
   demo. A real Vinna summary would route through a server-side model later. */
function summarize(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  const sentences = (clean.match(/[^.!?]+[.!?]*/g) ?? [clean]).map(s => s.trim()).filter(Boolean)
  if (sentences.length <= 2 && clean.length <= 180) return clean
  const first = sentences[0]
  const keyword = /(pain|cramp|tired|fatigue|energy|sleep|mood|stress|anxious|happy|sad|strong|heavy|bloat|ache|low|good|better|worse|rest|ride|train)/i
  const highlight = sentences.slice(1).find(s => keyword.test(s))
  let out = highlight ? `${first} ${highlight}` : first
  if (out.length > 220) out = out.slice(0, 217).trimEnd() + '…'
  return out
}

/* Minimal typing for the Web Speech API, which isn't in the default DOM lib. */
type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
function getRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  if (!Ctor) return null
  const r = new Ctor()
  r.continuous = true
  r.interimResults = true
  r.lang = 'en-CA'
  return r
}

export function JournalCard({ toast }: { toast: (m: string) => void }) {
  const { addJournalEntry } = useApp()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [interim, setInterim] = useState('')
  const [summary, setSummary] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const voiceSupported = typeof window !== 'undefined' && !!(getRecognition())

  // tidy up any live recognition if the sheet closes
  useEffect(() => {
    if (!open && recRef.current) { try { recRef.current.stop() } catch { /* ignore */ } }
  }, [open])

  function startVoice() {
    const rec = getRecognition()
    if (!rec) { toast('Voice input needs a browser like Chrome.'); return }
    recRef.current = rec
    setRecording(true)
    rec.onresult = (e) => {
      let live = ''
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i]
        const chunk = res[0]?.transcript ?? ''
        if (res.isFinal) { setText(prev => (prev ? prev + ' ' : '') + chunk.trim()); live = '' }
        else live += chunk
      }
      setInterim(live)
    }
    rec.onerror = () => { setRecording(false); setInterim('') }
    rec.onend = () => { setRecording(false); setInterim('') }
    try { rec.start() } catch { setRecording(false) }
  }
  function stopVoice() {
    setRecording(false)
    try { recRef.current?.stop() } catch { /* ignore */ }
  }

  function runSummary() {
    const s = summarize(text)
    if (!s) { toast('Write or speak something first.'); return }
    setSummary(s)
  }

  function reset() {
    setText(''); setInterim(''); setSummary(null); setRecording(false)
  }
  function save() {
    if (!text.trim()) { toast('Nothing to save yet.'); return }
    addJournalEntry(text.trim(), summary ?? undefined)
    setOpen(false); reset()
    toast('Journal entry saved to You → History.')
  }

  return (
    <>
      <button
        className="card accent lichen"
        style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
        onClick={() => setOpen(true)}
      >
        <div className="row between">
          <Eyebrow tone="lichen">Journal</Eyebrow>
          <span className="v-meta" style={{ color: 'var(--fg-positive)' }}>Write or speak →</span>
        </div>
        <p className="v-body" style={{ marginTop: 12 }}>
          A space to put the day into words. Type it, or hold the mic and talk, and Vinna can fold it into a short note for your history.
        </p>
      </button>

      <Sheet open={open} onClose={() => { setOpen(false); reset() }}>
        <Eyebrow tone="lichen">Journal</Eyebrow>
        <h2 className="v-h2" style={{ margin: '10px 0 6px' }}>How was today?</h2>
        <p className="v-meta" style={{ marginBottom: 16 }}>Write freely. Nothing here is scored, it is just yours.</p>

        <textarea
          className="field"
          style={{ minHeight: 140, resize: 'vertical', lineHeight: 1.6 }}
          placeholder="Today I felt…"
          value={text + (interim ? (text ? ' ' : '') + interim : '')}
          onChange={e => { setText(e.target.value); setInterim('') }}
        />

        {/* hold-to-speak */}
        <div className="row" style={{ gap: 12, marginTop: 12, alignItems: 'center' }}>
          <button
            className={`btn ${recording ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onPointerDown={(e) => { e.preventDefault(); startVoice() }}
            onPointerUp={stopVoice}
            onPointerLeave={() => recording && stopVoice()}
            disabled={!voiceSupported}
          >
            {recording ? '● Listening, release to stop' : '🎤 Hold to speak'}
          </button>
        </div>
        {!voiceSupported && (
          <p className="v-meta" style={{ marginTop: 8 }}>Voice input works in Chrome. You can always type instead.</p>
        )}

        {/* summarize with Vinna */}
        <div style={{ marginTop: 16 }}>
          <Btn variant="secondary" onClick={runSummary}>✦ Summarize with Vinna</Btn>
        </div>
        {summary && (
          <div className="card accent lichen reveal" style={{ marginTop: 14 }}>
            <div className="row between">
              <Badge tone="lichen" dot>Vinna summary</Badge>
              <button className="v-meta" style={{ color: 'var(--fg-accent)' }} onClick={runSummary}>Redo</button>
            </div>
            <p className="v-body-sm" style={{ marginTop: 10 }}>{summary}</p>
            <p className="v-meta" style={{ marginTop: 10 }}>Saved alongside your full entry.</p>
          </div>
        )}

        <div className="grid-2" style={{ marginTop: 20 }}>
          <Btn variant="secondary" onClick={() => { setOpen(false); reset() }}>Cancel</Btn>
          <Btn onClick={save}>Save entry →</Btn>
        </div>
      </Sheet>
    </>
  )
}
