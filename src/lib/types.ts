export type Mood = 'great' | 'okay' | 'low' | 'pain' | 'tired'
export type Rating = 'none' | 'some' | 'yes'
export type Tier = 'free' | 'plus' | 'deep'
export type NeedFilter = 'energy' | 'phase' | 'load' | 'recovery' | 'calm'
export type MealType = 'breakfast' | 'smoothie' | 'lunch' | 'snack' | 'dinner'

export interface Profile {
  name: string
  city: string
  cycleDay: number
  phase: string          // e.g. "Menstrual"
  tier: Tier
  goal: string           // e.g. "80km Haleakalā ride"
}

export interface FeelCheck {
  id: string
  mood: Mood
  symptoms: string[]
  note?: string
  cycleDay: number
  createdAt: string      // ISO
}

export interface LogEntry {
  id: string
  itemId: string
  itemTitle: string
  itemKind: 'herb' | 'recipe'
  cycleDay: number
  mood?: Mood
  ratings?: Record<string, Rating>
  createdAt: string
}

export type ShareAudience = 'partner' | 'loved_one' | 'care_team'

export interface Share {
  id: string
  name: string
  email: string
  audience: ShareAudience
  fields: string[]        // keys from shareFields that this person can see
  createdAt: string
}

export interface JournalEntry {
  id: string
  text: string            // the full entry, typed or spoken
  summary?: string        // the short "summarized with Vinna" version
  cycleDay: number
  createdAt: string
}

export interface AppointmentNote {
  id: string
  title: string
  body: string
  source: 'insight' | 'journal' | 'manual'
  createdAt: string
}

export interface SavedItem {
  id: string
  itemId: string
  itemKind: 'herb' | 'recipe' | 'research' | 'fact'
  createdAt: string
}

export interface Herb {
  id: string
  name: string
  latin: string
  glyph: string
  summary: string        // "Traditionally used to support …"
  needs: NeedFilter[]
  evidence: string       // e.g. "Evidence reviewed · 3 RCTs cited"
  traditional: string
  preparation: string
  caution: string
}

export interface Recipe {
  id: string
  title: string
  glyph: string
  why: string            // "Why this today"
  needs: NeedFilter[]
  meal: MealType
  time: string
  tags: string[]
  nutrients: { label: string; value: string }[]
  ingredients: string[]
  method: string[]
  evidence: string
}
