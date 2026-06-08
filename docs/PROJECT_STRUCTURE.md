# Project structure

This repo is organized around scalable feature domains instead of one large screen.

```text
src/
  app/              Router, shell, navigation config.
  components/       Reusable UI pieces.
  data/             Demo study sets and product copy.
  features/         Product domains that can grow independently.
    auth/
    dashboard/
    home/
    settings/
    strategy/
    study-session/
    study-sources/
  lib/              External service clients, currently Supabase.
  types/            Domain and generated-like database types.
  utils/            Pure helpers for study sessions.
  App.tsx           Router mount.
  styles.css        Global responsive design system.
supabase/
  schema.sql        Initial database schema, RLS policies, and indexes.
public/
  icon.svg          Original app icon.
  manifest.webmanifest
```

## Main flows

- Study: pick a set, tune strict mode, start a lock session, unlock with quiz.
- Sources: dedicated route for future PDF-to-quiz pipeline.
- Dashboard: dedicated route for analytics and event streams.
- Strategy: product positioning, weaknesses in current market and business model.
- Settings: global preferences and future native permissions.
- Auth: Google OAuth and email signup are wired through Supabase when env vars exist.

## Scalability decisions

- `App.tsx` only mounts the router.
- Route shell lives in `src/app`.
- Session behavior lives in `features/study-session/useStudySession.ts`.
- Auth UI lives in `features/auth`.
- PDF/source workflow lives in `features/study-sources`.
- Product strategy and analytics are separate routes, so they can evolve without bloating the study flow.

## Known platform boundary

The web app cannot block other phone apps at operating-system level. Real phone-wide blocking requires native iOS/Android integrations later.
