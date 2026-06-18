# Vinna

> The app that grows with you.

An intelligent whole-life women's health concierge — earthy, editorial, clinically credible.
This is the investor-demo MVP: a clickable, full-stack web app built to the Vinna brand system.

Built with **Vite + React + TypeScript** and **Supabase** (auth + database), deployed on **Vercel**.

## What's inside

- **Today** — Morning Concierge, cycle status, one-tap Feel Check (mood-adaptive symptom chips), Strava-synced ride prep with a Vinna+ paywall teaser, and a health-intelligence nudge.
- **Track** — Recovery day with Now / Midday / Evening time-window schedules, Altitude + Environment, and data-driven pattern insights.
- **Library** — light "reading" theme. Herbal & Recipes with a need-based filter, Save vs Log dual-action, optional binary ratings, and a "What's new" innovation feed.
- **You** — History / Saved / Patterns (each filterable), membership tiers, connected apps and granular sharing controls.
- **Onboarding** — a 4-step product tour plus real email/password and magic-link auth.

## Demo mode vs live mode

The app runs with **no backend by default** — every screen is seeded so it looks full, and
data persists to `localStorage`. The moment you add Supabase environment variables it switches
to real authentication and writes check-ins, logs and saves to your database.

## Run locally

```bash
npm install
npm run dev
```

To connect Supabase, copy `.env.example` to `.env.local` and fill in your project URL and anon key.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor to create the tables and row-level-security
policies (profiles, feel_checks, logs, saves).

## Deploy

Push to GitHub and import the repo in Vercel. Framework preset: **Vite**. Add the two
`VITE_SUPABASE_*` environment variables. That's it.

---

Brand: rust on near-black earth tones · Bebas Neue · Playfair Italic · Barlow · IBM Plex Mono.
No clinical claims, no pink/purple — health information is always framed as educational.
