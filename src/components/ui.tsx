import { useEffect, type ReactNode } from 'react'

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`v-wordmark ${className}`}>
      VINN<span className="a">A</span>
    </span>
  )
}

export function Eyebrow({ children, tone = 'rust', noRule = false }: { children: ReactNode; tone?: 'rust' | 'ochre' | 'lichen' | 'muted'; noRule?: boolean }) {
  const cls = tone === 'rust' ? '' : tone
  return <div className={`v-eyebrow ${cls} ${noRule ? 'no-rule' : ''}`}>{children}</div>
}

export function SectionHead({ eyebrow, title, tone = 'rust' }: { eyebrow: string; title: ReactNode; tone?: 'rust' | 'ochre' | 'lichen' | 'muted' }) {
  return (
    <div className="section-head">
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className="v-h2">{title}</h2>
    </div>
  )
}

export function Btn({ children, variant = 'primary', onClick, disabled, sm, type = 'button' }: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  onClick?: () => void
  disabled?: boolean
  sm?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button type={type} className={`btn btn-${variant} ${sm ? 'sm' : ''}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'rust', dot = false }: { children: ReactNode; tone?: 'rust' | 'ochre' | 'lichen'; dot?: boolean }) {
  return <span className={`badge ${tone} ${dot ? 'dot' : ''}`}>{children}</span>
}

export function Alert({ children, tone = 'rust', glyph = '⚠' }: { children: ReactNode; tone?: 'rust' | 'ochre' | 'lichen'; glyph?: string }) {
  return (
    <div className={`alert ${tone}`}>
      <span className="glyph">{glyph}</span>
      <div className="grow">{children}</div>
    </div>
  )
}

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        background: 'rgba(8,6,4,0.72)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        className="reveal"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxHeight: '88%', overflowY: 'auto',
          background: 'var(--bg-alt)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
          borderTop: '1px solid var(--border-soft)', padding: '8px 20px 32px',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 4, background: 'var(--border-bark)', margin: '8px auto 18px' }} />
        {children}
      </div>
    </div>
  )
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <div
      className="reveal"
      style={{
        position: 'absolute', left: 20, right: 20, bottom: 92, zIndex: 30,
        background: 'var(--vinna-card)', border: '1px solid var(--tint-rust-border)',
        borderLeft: '3px solid var(--vinna-rust)', borderRadius: 10, padding: '12px 16px',
        fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)',
      }}
    >
      {msg}
    </div>
  )
}
