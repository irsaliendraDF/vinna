import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

/**
 * Be forgiving about what VITE_SUPABASE_URL holds. A full URL is ideal, but if
 * only the bare project ref was pasted (e.g. "dtvjatkgawugqhdhwwih") we build the
 * canonical https://<ref>.supabase.co so the client never crashes on a bad URL.
 */
const url = !rawUrl
  ? undefined
  : /^https?:\/\//.test(rawUrl)
    ? rawUrl
    : `https://${rawUrl.replace(/^\/+|\/+$/g, '')}.supabase.co`

/**
 * When the Supabase env vars are present we use the real backend (auth + data).
 * When they're absent, e.g. before the project is wired, or for a quick
 * investor walkthrough, the app runs in DEMO MODE against localStorage so
 * every screen still looks full and the flows still work end to end.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null
