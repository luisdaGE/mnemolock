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
- private Storage bucket `study-sources`
- Storage policies scoped to each user's first-level folder

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

The current UI accepts PDF/TXT/MD files. TXT/MD can be chunked immediately; PDFs are stored and left for server-side extraction/OCR.

1. Store the file in Supabase Storage.
2. Insert a row in `study_sources`.
3. Extract text server-side.
4. Insert chunks in `source_chunks`.
5. Generate questions linked back to `source_chunk_id`.

## Storage

`supabase/schema.sql` creates a private bucket named `study-sources`. Client uploads use paths like:

```text
{auth.uid()}/{random-id}-{safe-file-name}
```

Policies on `storage.objects` allow authenticated users to read, upload, update and delete only files inside their own first-level folder. The PWA uses Supabase standard uploads, so files are capped at 6 MB in `appConfig.maxStandardUploadBytes`; larger uploads should move to resumable/TUS later.

## Edge Functions

Starter functions are included:

```bash
supabase functions deploy process-source
supabase functions deploy generate-questions
```

- `process-source`: downloads a source file, chunks TXT/MD, stores `source_chunks`, and marks PDFs as failed until a PDF/OCR worker is added.
- `generate-questions`: deterministic placeholder generator that creates questions with mandatory `source_chunk_id`. Replace the generator with an LLM call once API keys, quotas and review rules are configured.

Both functions require `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the Supabase Functions environment.
