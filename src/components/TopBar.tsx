import type { ReactNode } from 'react'
import { Wordmark } from './ui'

export function TopBar({ raw = false, right, left }: { raw?: boolean; right?: ReactNode; left?: ReactNode }) {
  return (
    <header className={`topbar ${raw ? 'raw' : ''}`}>
      {left ?? <Wordmark />}
      <div className="row" style={{ gap: 4 }}>{right}</div>
    </header>
  )
}
