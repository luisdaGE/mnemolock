# Supabase setup

## Environment variables

Copy `.env.example` to `.env.local` and fill:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database

Run `supabase/schema.sql` in the Supabase SQL editor. It creates:

- `profiles`
- `user_settings`
- `study_sets`
- `questions`
- `study_sources`
- `source_chunks`
- `focus_sessions`
- `quiz_attempts`
- `question_attempts`

The script enables RLS and recreates policies safely with `drop policy if exists`.

## Analytics model

`focus_sessions` tracks lock lifecycle. `quiz_attempts` tracks whether the user passed or failed an unlock quiz. `question_attempts` tracks answer-level behavior.

Keeping these separate makes it easier to add dashboards, spaced repetition, school reporting and model improvement later.

## Google auth

1. Enable Google in Supabase Auth providers.
2. Add local redirect URL: `http://localhost:5174`.
3. Add production redirect URL after deploying to Vercel.
4. Add the same production URL in Google Cloud OAuth authorized redirect settings.

## File upload roadmap

The current UI accepts PDF/TXT/MD files locally. Production upload should:

1. Store the file in Supabase Storage.
2. Insert a row in `study_sources`.
3. Extract text server-side.
4. Insert chunks in `source_chunks`.
5. Generate questions linked back to `source_chunk_id`.
