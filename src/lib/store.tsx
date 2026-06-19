import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import { demoProfile } from './data'
import type { FeelCheck, LogEntry, Mood, Profile, Rating, SavedItem, Tier } from './types'

interface AppUser { id: string; email: string; isDemo: boolean }

interface AppState {
  ready: boolean
  user: AppUser | null
  profile: Profile
  feelChecks: FeelCheck[]
  logs: LogEntry[]
  saves: SavedItem[]
  // auth
  signUp: (email: string, password: string, name?: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signInMagic: (email: string, name?: string) => Promise<string | null>
  continueAsGuest: () => void
  signOut: () => Promise<void>
  // data
  addFeelCheck: (mood: Mood, symptoms: string[], note?: string) => void
  addLog: (itemId: string, itemTitle: string, itemKind: 'herb' | 'recipe', mood?: Mood, ratings?: Record<string, Rating>) => void
  toggleSave: (itemId: string, itemKind: SavedItem['itemKind']) => void
  isSaved: (itemId: string) => boolean
  setTier: (tier: Tier) => void
  // account
  consent: boolean
  setConsent: (v: boolean) => void
  updateEmail: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  deleteAccount: () => Promise<void>
}

const Ctx = createContext<AppState | null>(null)
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString()
const firstName = (full: string) => {
  const w = full.trim().split(/\s+/)[0] || ''
  return w ? w.charAt(0).toUpperCase() + w.slice(1) : ''
}

function seedData(): { feelChecks: FeelCheck[]; logs: LogEntry[]; saves: SavedItem[] } {
  return {
    feelChecks: [
      { id: uid(), mood: 'tired', symptoms: ['Cramps', 'Fatigue'], cycleDay: 1, createdAt: daysAgo(0) },
      { id: uid(), mood: 'okay', symptoms: ['Steady energy'], cycleDay: 26, createdAt: daysAgo(3) },
      { id: uid(), mood: 'great', symptoms: ['Good sleep', 'Strong legs'], cycleDay: 18, createdAt: daysAgo(11) },
    ],
    logs: [
      { id: uid(), itemId: 'ginger', itemTitle: 'Ginger', itemKind: 'herb', cycleDay: 1, mood: 'tired', ratings: { 'Cramp relief': 'yes' }, createdAt: daysAgo(0) },
      { id: uid(), itemId: 'iron-bowl', itemTitle: 'Iron-forward beef & lentil bowl', itemKind: 'recipe', cycleDay: 1, createdAt: daysAgo(0) },
      { id: uid(), itemId: 'magnesium', itemTitle: 'Magnesium glycinate', itemKind: 'herb', cycleDay: 27, mood: 'okay', ratings: { 'Sleep quality': 'yes' }, createdAt: daysAgo(2) },
    ],
    saves: [
      { id: uid(), itemId: 'cherry-smoothie', itemKind: 'recipe', createdAt: daysAgo(1) },
      { id: uid(), itemId: 'beetroot', itemKind: 'herb', createdAt: daysAgo(4) },
      { id: uid(), itemId: 'ginger-oats', itemKind: 'recipe', createdAt: daysAgo(6) },
    ],
  }
}

const LS = (id: string) => `vinna_state_${id}`

function loadLocal(id: string) {
  try {
    const raw = localStorage.getItem(LS(id))
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<AppUser | null>(null)
  const [profile, setProfile] = useState<Profile>(demoProfile)
  const [feelChecks, setFeelChecks] = useState<FeelCheck[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [saves, setSaves] = useState<SavedItem[]>([])
  const [consent, setConsentState] = useState<boolean>(() => {
    try { return localStorage.getItem('vinna_consent') !== 'false' } catch { return true }
  })

  // hydrate state for a given user id (local cache is source of truth for rendering)
  function hydrate(u: AppUser) {
    // Personalise the greeting with the name the account holder gave at sign-up.
    const savedName = localStorage.getItem('vinna_name')
    const withName = (p: Profile) => (savedName ? { ...p, name: firstName(savedName) } : p)
    const cached = loadLocal(u.id)
    if (cached) {
      setProfile(withName(cached.profile ?? demoProfile))
      setFeelChecks(cached.feelChecks ?? [])
      setLogs(cached.logs ?? [])
      setSaves(cached.saves ?? [])
    } else {
      const seed = seedData()
      setProfile(withName(demoProfile))
      setFeelChecks(seed.feelChecks)
      setLogs(seed.logs)
      setSaves(seed.saves)
    }
  }

  // restore session
  useEffect(() => {
    let active = true
    async function boot() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession()
        const s = data.session
        if (s && active) {
          rememberName(s.user.user_metadata?.full_name)
          const u: AppUser = { id: s.user.id, email: s.user.email ?? '', isDemo: false }
          setUser(u); hydrate(u)
        }
        // Note: we intentionally do NOT auto-restore the guest/demo session.
        // Every fresh visit starts on the welcome screen so the full journey
        // (tour + sign-in choice) always shows. Only a real Supabase session
        // keeps a returning, signed-in user logged in.
        supabase.auth.onAuthStateChange((_e, sess) => {
          if (!sess) return
          rememberName(sess.user.user_metadata?.full_name)
          const u: AppUser = { id: sess.user.id, email: sess.user.email ?? '', isDemo: false }
          setUser(u); hydrate(u)
        })
      }
      if (active) setReady(true)
    }
    boot()
    return () => { active = false }
  }, [])

  // persist to local cache + mirror to Supabase when a real user is signed in
  useEffect(() => {
    if (!user) return
    const snapshot = { profile, feelChecks, logs, saves }
    try { localStorage.setItem(LS(user.id), JSON.stringify(snapshot)) } catch { /* ignore */ }
  }, [user, profile, feelChecks, logs, saves])

  async function syncRow(table: string, row: Record<string, unknown>) {
    if (!isSupabaseConfigured || !supabase || !user || user.isDemo) return
    try { await supabase.from(table).insert({ user_id: user.id, ...row }) } catch { /* non-fatal */ }
  }

  function rememberName(name?: unknown) {
    if (typeof name === 'string' && name.trim()) localStorage.setItem('vinna_name', name.trim())
  }

  function continueGuest() {
    // The demo tour is Aga's world, so clear any saved name and stay as Aga.
    localStorage.removeItem('vinna_name')
    const u: AppUser = { id: 'guest', email: 'aga@vinna.demo', isDemo: true }
    localStorage.setItem('vinna_guest', JSON.stringify(u))
    setUser(u); hydrate(u)
  }

  const state: AppState = {
    ready, user, profile, feelChecks, logs, saves,

    async signUp(email, password, name) {
      rememberName(name)
      if (!isSupabaseConfigured || !supabase) {
        const u: AppUser = { id: 'guest', email: email || 'you@vinna.demo', isDemo: true }
        localStorage.setItem('vinna_guest', JSON.stringify(u)); setUser(u); hydrate(u); return null
      }
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name ?? null } } })
      return error ? error.message : null
    },
    async signIn(email, password) {
      if (!isSupabaseConfigured || !supabase) { continueGuest(); return null }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? error.message : null
    },
    async signInMagic(email, name) {
      rememberName(name)
      if (!isSupabaseConfigured || !supabase) { continueGuest(); return null }
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin, data: name ? { full_name: name } : undefined } })
      return error ? error.message : null
    },
    continueAsGuest() { continueGuest() },
    async signOut() {
      localStorage.removeItem('vinna_guest')
      if (isSupabaseConfigured && supabase) { try { await supabase.auth.signOut() } catch { /* ignore */ } }
      setUser(null); setProfile(demoProfile); setFeelChecks([]); setLogs([]); setSaves([])
    },

    addFeelCheck(mood, symptoms, note) {
      const fc: FeelCheck = { id: uid(), mood, symptoms, note, cycleDay: profile.cycleDay, createdAt: new Date().toISOString() }
      setFeelChecks(prev => [fc, ...prev])
      syncRow('feel_checks', { mood, symptoms, note: note ?? null, cycle_day: profile.cycleDay })
    },
    addLog(itemId, itemTitle, itemKind, mood, ratings) {
      const entry: LogEntry = { id: uid(), itemId, itemTitle, itemKind, cycleDay: profile.cycleDay, mood, ratings, createdAt: new Date().toISOString() }
      setLogs(prev => [entry, ...prev])
      syncRow('logs', { item_id: itemId, item_title: itemTitle, item_kind: itemKind, cycle_day: profile.cycleDay, mood: mood ?? null, ratings: ratings ?? null })
    },
    toggleSave(itemId, itemKind) {
      setSaves(prev => {
        const existing = prev.find(s => s.itemId === itemId)
        if (existing) return prev.filter(s => s.itemId !== itemId)
        const s: SavedItem = { id: uid(), itemId, itemKind, createdAt: new Date().toISOString() }
        syncRow('saves', { item_id: itemId, item_kind: itemKind })
        return [s, ...prev]
      })
    },
    isSaved(itemId) { return saves.some(s => s.itemId === itemId) },
    setTier(tier) { setProfile(p => ({ ...p, tier })) },

    consent,
    setConsent(v) {
      setConsentState(v)
      try { localStorage.setItem('vinna_consent', v ? 'true' : 'false') } catch { /* ignore */ }
    },
    async updateEmail(email) {
      if (!isSupabaseConfigured || !supabase || user?.isDemo) return null
      const { error } = await supabase.auth.updateUser({ email })
      return error ? error.message : null
    },
    async updatePassword(password) {
      if (!isSupabaseConfigured || !supabase || user?.isDemo) return null
      const { error } = await supabase.auth.updateUser({ password })
      return error ? error.message : null
    },
    async deleteAccount() {
      // Remove the account holder's data this app controls, then sign out.
      if (isSupabaseConfigured && supabase && user && !user.isDemo) {
        try {
          await supabase.from('saves').delete().eq('user_id', user.id)
          await supabase.from('logs').delete().eq('user_id', user.id)
          await supabase.from('feel_checks').delete().eq('user_id', user.id)
          await supabase.from('profiles').delete().eq('id', user.id)
        } catch { /* best effort */ }
      }
      if (user) { try { localStorage.removeItem(LS(user.id)) } catch { /* ignore */ } }
      localStorage.removeItem('vinna_name'); localStorage.removeItem('vinna_guest')
      if (isSupabaseConfigured && supabase) { try { await supabase.auth.signOut() } catch { /* ignore */ } }
      setUser(null); setProfile(demoProfile); setFeelChecks([]); setLogs([]); setSaves([])
    },
  }

  const value = useMemo(() => state, [ready, user, profile, feelChecks, logs, saves, consent])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
