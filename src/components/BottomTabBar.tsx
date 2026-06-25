export type Tab = 'today' | 'track' | 'community' | 'library' | 'you'

const TABS: { id: Tab; glyph: string; label: string }[] = [
  { id: 'today', glyph: '◉', label: 'Today' },
  { id: 'track', glyph: '○', label: 'Track' },
  { id: 'community', glyph: '⬡', label: 'Community' },
  { id: 'library', glyph: '◈', label: 'Library' },
  { id: 'you', glyph: '◇', label: 'You' },
]

export function BottomTabBar({ active, onChange, raw = false }: { active: Tab; onChange: (t: Tab) => void; raw?: boolean }) {
  return (
    <nav className={`tabbar ${raw ? 'raw' : ''}`}>
      {TABS.map(t => (
        <button key={t.id} className={`tab ${active === t.id ? 'on' : ''}`} onClick={() => onChange(t.id)}>
          <span className="glyph">{t.glyph}</span>
          <span className="lbl">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
