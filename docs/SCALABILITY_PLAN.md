# Scalability plan

## Frontend

- Keep route-level screens in `features/*`.
- Keep reusable visual primitives in `components/`.
- Keep business/session logic in hooks or services, not inside page components.
- Add TanStack Query when Supabase reads/writes become real and frequent.
- Add Zustand only if local app state grows beyond the current study session.

## Backend

- Store files in Supabase Storage.
- Process PDFs in Edge Functions or a server worker.
- Store text chunks in `source_chunks`.
- Link generated questions to `source_chunk_id`.
- Store quiz results in `quiz_attempts` and `question_attempts`.

## Product

- Individual student plan first.
- Then add organizations, classrooms, assignments and teacher dashboards.
- Keep all generated questions explainable by source.

## Testing

- Unit test `utils/study.ts`.
- Component test `LockPanel`.
- E2E test: start session, fail quiz, cooldown, pass quiz.
- RLS tests once Supabase local is introduced.
