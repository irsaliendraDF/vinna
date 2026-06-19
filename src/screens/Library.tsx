import { useState } from 'react'
import { useApp } from '../lib/store'
import { TopBar } from '../components/TopBar'
import { Eyebrow, Badge, Btn } from '../components/ui'
import { herbs, recipes, innovations, needLabels } from '../lib/data'
import type { Herb, NeedFilter, Rating, Recipe } from '../lib/types'

type Sub = 'herbal' | 'recipes' | 'new'
const NEEDS: NeedFilter[] = ['energy', 'phase', 'load', 'recovery', 'calm']

export function Library({ toast }: { toast: (m: string) => void }) {
  const [sub, setSub] = useState<Sub>('herbal')
  const [need, setNeed] = useState<NeedFilter | null>(null)
  const [herb, setHerb] = useState<Herb | null>(null)
  const [recipe, setRecipe] = useState<Recipe | null>(null)

  if (herb) return <HerbDetail herb={herb} onBack={() => setHerb(null)} toast={toast} />
  if (recipe) return <RecipeDetail recipe={recipe} onBack={() => setRecipe(null)} toast={toast} />

  const filteredHerbs = need ? herbs.filter(h => h.needs.includes(need)) : herbs
  const filteredRecipes = need ? recipes.filter(r => r.needs.includes(need)) : recipes

  return (
    <>
      <TopBar raw left={<span className="v-wordmark" style={{ fontSize: 26, letterSpacing: 4, color: 'var(--raw-ink)' }}>VINN<span style={{ color: 'var(--vinna-rust)' }}>A</span></span>} right={<span className="v-label" style={{ color: 'var(--raw-ink-3)' }}>Library</span>} />
      <div className="scroll">
        <div className="screen raw">
          <div className="reveal" style={{ paddingTop: 22 }}>
            <Eyebrow>Library</Eyebrow>
            <h1 className="v-h1" style={{ marginTop: 12, color: 'var(--raw-ink)' }}>What your<br /><span>body needs.</span></h1>
            <p className="v-body" style={{ marginTop: 12, color: 'var(--raw-ink-2)' }}>Reference, not action. Pull up what today asks for, every entry is honest about what the evidence says.</p>
          </div>

          <div className="row wrap" style={{ gap: 8, marginTop: 20 }}>
            {(['herbal', 'recipes', 'new'] as Sub[]).map(s => (
              <button key={s} className={`chip ${sub === s ? 'on' : ''}`} onClick={() => { setSub(s); setNeed(null) }}>
                {s === 'herbal' ? 'Herbal' : s === 'recipes' ? 'Recipes' : "What's new"}
              </button>
            ))}
          </div>

          {sub !== 'new' && (
            <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
              <button className={`chip ${need === null ? 'on' : ''}`} onClick={() => setNeed(null)}>All</button>
              {NEEDS.map(n => (
                <button key={n} className={`chip ${need === n ? 'on' : ''}`} onClick={() => setNeed(n)}>{needLabels[n]}</button>
              ))}
            </div>
          )}

          {sub === 'herbal' && (
            <div className="stack" style={{ marginTop: 20 }}>
              {filteredHerbs.map(h => (
                <button key={h.id} className="card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setHerb(h)}>
                  <div className="row between">
                    <span className="v-card-title">{h.glyph}&nbsp;&nbsp;{h.name}</span>
                    <span style={{ color: 'var(--raw-ink-3)' }}>→</span>
                  </div>
                  <p className="v-body-sm" style={{ margin: '6px 0 12px' }}>{h.summary}</p>
                  <span className="v-meta" style={{ color: 'var(--fg-positive)' }}>✓ {h.evidence}</span>
                </button>
              ))}
            </div>
          )}

          {sub === 'recipes' && (
            <div className="stack" style={{ marginTop: 20 }}>
              {filteredRecipes.map(r => (
                <button key={r.id} className="card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setRecipe(r)}>
                  <div className="row between">
                    <span className="v-card-title">{r.title}</span>
                    <span style={{ color: 'var(--raw-ink-3)' }}>→</span>
                  </div>
                  <div className="row wrap" style={{ gap: 6, margin: '10px 0' }}>
                    {r.tags.map(t => <span key={t} className="chip" style={{ padding: '4px 10px', fontSize: 9 }}>{t}</span>)}
                    <span className="chip" style={{ padding: '4px 10px', fontSize: 9 }}>{r.time}</span>
                  </div>
                  <span className="v-meta" style={{ color: 'var(--fg-positive)' }}>✓ {r.evidence}</span>
                </button>
              ))}
            </div>
          )}

          {sub === 'new' && (
            <div className="stack" style={{ marginTop: 20 }}>
              {innovations.map(i => (
                <div key={i.id} className="card accent">
                  <Eyebrow tone="rust">{i.eyebrow}</Eyebrow>
                  <h3 className="v-card-title" style={{ margin: '12px 0 6px', fontSize: 16 }}>{i.title}</h3>
                  <p className="v-body-sm" style={{ marginBottom: 12 }}>{i.blurb}</p>
                  <span className="v-meta" style={{ color: 'var(--fg-positive)' }}>✓ {i.evidence}</span>
                </div>
              ))}
              <p className="v-meta center" style={{ color: 'var(--raw-ink-3)', marginTop: 6 }}>Innovation content is always free.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ---------- Save vs Log action block ---------- */
function ActionBlock({ id, title, kind, toast }: { id: string; title: string; kind: 'herb' | 'recipe'; toast: (m: string) => void }) {
  const { toggleSave, isSaved, addLog } = useApp()
  const [rating, setRating] = useState(false)
  const saved = isSaved(id)
  const questions = kind === 'herb'
    ? ['Cramp relief', 'Felt calmer']
    : ['Satisfied', 'Energy after']

  if (rating) {
    return <RatingStep questions={questions} onDone={(r) => { addLog(id, title, kind, undefined, r); setRating(false); toast('Logged as used today.') }} onSkip={() => { addLog(id, title, kind); setRating(false); toast('Logged as used today.') }} />
  }

  return (
    <div className="grid-2">
      <button className={`btn btn-secondary`} onClick={() => { toggleSave(id, kind); toast(saved ? 'Removed from Saved.' : 'Saved for later.') }}>
        {saved ? '★ Saved' : '♥ Save'}
      </button>
      <button className="btn btn-primary" onClick={() => setRating(true)}>Log as used →</button>
    </div>
  )
}

function RatingStep({ questions, onDone, onSkip }: { questions: string[]; onDone: (r: Record<string, Rating>) => void; onSkip: () => void }) {
  const [answers, setAnswers] = useState<Record<string, Rating>>({})
  return (
    <div className="card" style={{ background: 'var(--raw-card)' }}>
      <Eyebrow>How did it go?</Eyebrow>
      <p className="v-body-sm" style={{ margin: '8px 0 16px' }}>Optional. Two quick questions, tied to today's use, never a 1–10 scale.</p>
      <div className="stack-sm">
        {questions.map(q => (
          <div key={q}>
            <p className="v-label" style={{ marginBottom: 8 }}>{q}</p>
            <div className="row" style={{ gap: 8 }}>
              {(['none', 'some', 'yes'] as Rating[]).map(r => (
                <button key={r} className={`chip ${answers[q] === r ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAnswers(a => ({ ...a, [q]: r }))}>{r}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid-2" style={{ marginTop: 18 }}>
        <button className="btn btn-secondary" onClick={onSkip}>Skip</button>
        <button className="btn btn-primary" onClick={() => onDone(answers)}>Save →</button>
      </div>
    </div>
  )
}

/* ---------- Herb detail (raw reading) ---------- */
function HerbDetail({ herb, onBack, toast }: { herb: Herb; onBack: () => void; toast: (m: string) => void }) {
  return (
    <>
      <TopBar raw left={<button className="icon-btn" style={{ color: 'var(--raw-ink-2)' }} onClick={onBack}>←</button>} right={<span className="v-label" style={{ color: 'var(--raw-ink-3)' }}>Herbal</span>} />
      <div className="scroll">
        <div className="screen raw">
          <div className="reveal" style={{ paddingTop: 22 }}>
            <Eyebrow>{herb.glyph} Herb</Eyebrow>
            <h1 className="v-h1" style={{ marginTop: 12, color: 'var(--raw-ink)' }}>{herb.name}</h1>
            <p className="v-quote" style={{ marginTop: 8, color: 'var(--raw-ink-2)' }}>{herb.latin}</p>
            <div style={{ marginTop: 14 }}><Badge tone="lichen" dot>✓ {herb.evidence}</Badge></div>
          </div>

          <div className="stack" style={{ marginTop: 22 }}>
            <Layer title="Traditionally used for" body={herb.traditional} />
            <Layer title="How it's prepared" body={herb.preparation} />
            <div className="card accent ochre" style={{ background: 'var(--raw-card)' }}>
              <Eyebrow tone="ochre">⚠ Honest about limits</Eyebrow>
              <p className="v-body-sm" style={{ marginTop: 10, color: 'var(--raw-ink-2)' }}>{herb.caution}</p>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <ActionBlock id={herb.id} title={herb.name} kind="herb" toast={toast} />
          </div>
        </div>
      </div>
    </>
  )
}

/* ---------- Recipe detail (3 layers) ---------- */
function RecipeDetail({ recipe, onBack, toast }: { recipe: Recipe; onBack: () => void; toast: (m: string) => void }) {
  const [layer, setLayer] = useState<0 | 1 | 2>(0)
  return (
    <>
      <TopBar raw left={<button className="icon-btn" style={{ color: 'var(--raw-ink-2)' }} onClick={onBack}>←</button>} right={<span className="v-label" style={{ color: 'var(--raw-ink-3)' }}>Recipe</span>} />
      <div className="scroll">
        <div className="screen raw">
          <div className="reveal" style={{ paddingTop: 22 }}>
            <Eyebrow>{recipe.glyph} Recipe</Eyebrow>
            <h1 className="v-h1" style={{ marginTop: 12, color: 'var(--raw-ink)' }}>{recipe.title}</h1>
            <div className="row wrap" style={{ gap: 6, marginTop: 12 }}>
              {recipe.tags.map(t => <span key={t} className="chip">{t}</span>)}
              <span className="chip">{recipe.time}</span>
            </div>
          </div>

          <div className="card accent" style={{ background: 'var(--raw-card)', marginTop: 20 }}>
            <p className="v-label" style={{ marginBottom: 8 }}>Why this today</p>
            <p className="v-body-sm" style={{ color: 'var(--raw-ink-2)' }}>{recipe.why}</p>
          </div>

          <div className="row wrap" style={{ gap: 8, marginTop: 20 }}>
            {['Nutrients', 'What it is', 'Full recipe'].map((l, i) => (
              <button key={l} className={`chip ${layer === i ? 'on' : ''}`} onClick={() => setLayer(i as 0 | 1 | 2)}>{l}</button>
            ))}
          </div>

          {layer === 0 && (
            <div className="card reveal" style={{ background: 'var(--raw-card)', marginTop: 16 }}>
              <p className="v-label" style={{ marginBottom: 12 }}>Nutrients, the why</p>
              <div className="stack-sm">
                {recipe.nutrients.map(n => (
                  <div key={n.label} className="row between">
                    <span className="v-body-sm" style={{ color: 'var(--raw-ink)' }}>{n.label}</span>
                    <span className="v-label" style={{ color: 'var(--fg-accent)' }}>{n.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {layer === 1 && (
            <div className="card reveal" style={{ background: 'var(--raw-card)', marginTop: 16 }}>
              <p className="v-label" style={{ marginBottom: 12 }}>Ingredients, the what</p>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
                {recipe.ingredients.map(i => (
                  <li key={i} className="v-body-sm row" style={{ alignItems: 'flex-start', gap: 10, color: 'var(--raw-ink-2)' }}>
                    <span style={{ color: 'var(--fg-accent)' }}>·</span><span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {layer === 2 && (
            <div className="card reveal" style={{ background: 'var(--raw-card)', marginTop: 16 }}>
              <p className="v-label" style={{ marginBottom: 12 }}>Method, the how</p>
              <ol style={{ listStyle: 'none', display: 'grid', gap: 12, counterReset: 'step' }}>
                {recipe.method.map(m => (
                  <li key={m} className="v-body-sm row" style={{ alignItems: 'flex-start', gap: 12, color: 'var(--raw-ink-2)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--fg-accent)', lineHeight: 1 }}>·</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <span className="v-meta" style={{ color: 'var(--fg-positive)' }}>✓ {recipe.evidence}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <ActionBlock id={recipe.id} title={recipe.title} kind="recipe" toast={toast} />
          </div>
        </div>
      </div>
    </>
  )
}

function Layer({ title, body }: { title: string; body: string }) {
  return (
    <div className="card" style={{ background: 'var(--raw-card)' }}>
      <p className="v-label" style={{ marginBottom: 8 }}>{title}</p>
      <p className="v-body-sm" style={{ color: 'var(--raw-ink-2)' }}>{body}</p>
    </div>
  )
}
