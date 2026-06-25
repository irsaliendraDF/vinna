import { useCallback, useRef, useState } from 'react'
import { useApp } from './lib/store'
import { BottomTabBar, type Tab } from './components/BottomTabBar'
import { Sheet, Toast, Wordmark } from './components/ui'
import { Paywall } from './components/Paywall'
import { Onboarding } from './screens/Onboarding'
import { Today } from './screens/Today'
import { Track } from './screens/Track'
import { Community } from './screens/Community'
import { Library } from './screens/Library'
import { You } from './screens/You'

export default function App() {
  const { ready, user } = useApp()
  const [tab, setTab] = useState<Tab>('today')
  const [paywall, setPaywall] = useState<string | null | false>(false) // false = closed; string|null = open with context
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const fireToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const openPaywall = useCallback((ctx?: string) => setPaywall(ctx ?? null), [])

  if (!ready) {
    return (
      <div className="stage">
        <div className="phone" style={{ display: 'grid', placeItems: 'center' }}>
          <div className="reveal" style={{ textAlign: 'center' }}>
            <Wordmark />
            <p className="v-meta" style={{ marginTop: 14 }}>Loading…</p>
          </div>
        </div>
      </div>
    )
  }

  const raw = tab === 'library'

  return (
    <div className="stage">
      <div className="phone">
        {!user ? (
          <Onboarding />
        ) : (
          <>
            <div key={tab} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {tab === 'today' && <Today openPaywall={openPaywall} toast={fireToast} goTab={setTab} />}
              {tab === 'track' && <Track openPaywall={openPaywall} />}
              {tab === 'community' && <Community toast={fireToast} />}
              {tab === 'library' && <Library toast={fireToast} />}
              {tab === 'you' && <You openPaywall={openPaywall} toast={fireToast} />}
            </div>
            <BottomTabBar active={tab} onChange={setTab} raw={raw} />
            <Toast msg={toast} />
            <Sheet open={paywall !== false} onClose={() => setPaywall(false)}>
              <Paywall context={paywall || undefined} onClose={() => setPaywall(false)} />
            </Sheet>
          </>
        )}
      </div>
    </div>
  )
}
