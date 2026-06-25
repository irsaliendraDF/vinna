import { useState } from 'react'
import { TopBar } from '../components/TopBar'
import { Eyebrow, Badge, Btn } from '../components/ui'
import { communitySources, communityChallenges, communityClubs } from '../lib/data'

type Sub = 'yours' | 'discover'

export function Community({ toast }: { toast: (m: string) => void }) {
  const [sub, setSub] = useState<Sub>('yours')
  // demo-only join state, seeded from the data's joined flag
  const [joined, setJoined] = useState<Record<string, boolean>>(
    () => Object.fromEntries(communityClubs.map(c => [c.id, c.joined])),
  )
  const isJoined = (id: string) => joined[id]
  const toggleJoin = (id: string, name: string, access: 'active' | 'read-only') => {
    setJoined(prev => {
      const next = !prev[id]
      toast(next ? `Joined ${name}${access === 'read-only' ? ', read-only' : ''}.` : `Left ${name}.`)
      return { ...prev, [id]: next }
    })
  }

  const yourClubs = communityClubs.filter(c => isJoined(c.id))
  const discoverClubs = communityClubs.filter(c => !isJoined(c.id))

  return (
    <>
      <TopBar right={<button className="icon-btn" title="Connected apps">◍</button>} />
      <div className="scroll">
        <div className="screen">
          <div className="reveal" style={{ paddingTop: 22 }}>
            <Eyebrow>Community</Eyebrow>
            <h1 className="v-h1" style={{ marginTop: 12 }}>Where you<br /><span>belong.</span></h1>
            <p className="v-body" style={{ marginTop: 12 }}>
              The circles, challenges and clubs you are part of, pulled together from the apps you already use and from
              inside Vinna. Join as loudly or as quietly as you like.
            </p>
          </div>

          {/* what you're synced with */}
          <div className="reveal d1" style={{ marginTop: 22 }}>
            <Eyebrow noRule>Synced with</Eyebrow>
            <div className="stack-sm" style={{ marginTop: 12 }}>
              {communitySources.map(s => (
                <div key={s.id} className="card flat" style={{ padding: 14 }}>
                  <div className="row between">
                    <div className="row" style={{ gap: 12 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--fg-1)' }}>{s.glyph}</span>
                      <div>
                        <p className="v-card-title" style={{ fontSize: 14 }}>{s.name}</p>
                        <p className="v-meta" style={{ marginTop: 2 }}>{s.note}</p>
                      </div>
                    </div>
                    {s.status === 'Synced'
                      ? <Badge tone="lichen" dot>{s.status}</Badge>
                      : <Btn sm variant="secondary" onClick={() => toast(`${s.name} connection is illustrative in this demo.`)}>{s.status}</Btn>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* sub-nav */}
          <div className="row wrap" style={{ gap: 8, marginTop: 24 }}>
            {(['yours', 'discover'] as Sub[]).map(s => (
              <button key={s} className={`chip ${sub === s ? 'on' : ''}`} onClick={() => setSub(s)}>
                {s === 'yours' ? 'Yours' : 'Discover'}
              </button>
            ))}
          </div>

          {sub === 'yours' && (
            <div className="reveal" style={{ marginTop: 18 }}>
              <Eyebrow noRule>Challenges you're in</Eyebrow>
              <div className="stack" style={{ marginTop: 12 }}>
                {communityChallenges.map(c => (
                  <div key={c.id} className="card accent">
                    <div className="row between">
                      <Eyebrow tone="rust">● {c.source}</Eyebrow>
                      <span className="v-meta">{c.members.toLocaleString()} in</span>
                    </div>
                    <h3 className="v-card-title" style={{ margin: '12px 0 6px', fontSize: 16 }}>{c.title}</h3>
                    <p className="v-body-sm" style={{ marginBottom: 14 }}>{c.blurb}</p>
                    <div className="progress-bar"><i style={{ width: `${Math.round(c.progress * 100)}%` }} /></div>
                    <p className="v-meta" style={{ marginTop: 8 }}>{Math.round(c.progress * 100)}% of the way</p>
                  </div>
                ))}
              </div>

              <Eyebrow noRule >Your clubs</Eyebrow>
              <div className="stack" style={{ marginTop: 12 }}>
                {yourClubs.length === 0 ? (
                  <div className="card flat center" style={{ padding: 24 }}>
                    <p className="v-body-sm">You have not joined a club yet. Have a look in Discover.</p>
                  </div>
                ) : yourClubs.map(c => (
                  <ClubCard key={c.id} club={c} joined onToggle={() => toggleJoin(c.id, c.name, c.access)} />
                ))}
              </div>
            </div>
          )}

          {sub === 'discover' && (
            <div className="reveal stack" style={{ marginTop: 18 }}>
              <p className="v-meta">Spaces for women at every stage. Some are active threads, some are quiet and read-only.</p>
              {discoverClubs.map(c => (
                <ClubCard key={c.id} club={c} joined={false} onToggle={() => toggleJoin(c.id, c.name, c.access)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ClubCard({ club, joined, onToggle }: {
  club: typeof communityClubs[number]
  joined: boolean
  onToggle: () => void
}) {
  return (
    <div className="card">
      <div className="row between">
        <span className="v-card-title">{club.name}</span>
        <span className="v-meta">{club.members.toLocaleString()} members</span>
      </div>
      <p className="v-body-sm" style={{ margin: '8px 0 12px' }}>{club.blurb}</p>
      <div className="row between">
        <div className="row" style={{ gap: 6 }}>
          <Badge tone={club.access === 'read-only' ? 'ochre' : 'lichen'}>
            {club.access === 'read-only' ? 'Read-only · passive' : 'Active threads'}
          </Badge>
          {club.source && <Badge tone="rust" dot>{club.source}</Badge>}
        </div>
        <Btn sm variant={joined ? 'secondary' : 'primary'} onClick={onToggle}>
          {joined ? 'Leave' : club.access === 'read-only' ? 'Follow →' : 'Join →'}
        </Btn>
      </div>
    </div>
  )
}
