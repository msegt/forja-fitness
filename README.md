# Forja Fitness

Forja Fitness is a Next.js 14 web app that acts as a friendly British AI personal trainer. It helps users onboard quickly, generate progressive workout plans, follow daily sessions with video support, and chat with an encouraging assistant.

## Tech stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Auth & data:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **AI:** Google Gemini (`@google/generative-ai`)
- **Video search:** YouTube Data API v3

## Features

- Landing page with sign-up and log-in calls to action
- Email/password and Google OAuth login and registration with real Supabase auth
- Email confirmation handling on sign-up (detects pending confirmation and duplicate accounts)
- Multi-step onboarding wizard that generates a first workout plan with Gemini
- Weekly dashboard that fetches sessions from Supabase with a progress ring and completion tracking
- Session detail page with exercise guidance, coaching tips, and YouTube links
- Mark session complete via Server Action — persists `completed_at` to Supabase, revalidates dashboard
- Inline error banners for session completion failures (auto-cleared from the URL after display)
- AI chat with quick actions and persistent message storage
- Holiday mode plan generation flow
- Profile settings page
- Supabase migration with RLS policies and signup profile trigger

## Project structure

```text
forja-fitness/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth/login/page.tsx
│   ├── auth/register/page.tsx
│   ├── onboarding/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── actions.ts                  # Server Action for session completion
│   │   ├── completionErrors.ts         # Error code map and message lookup
│   │   ├── ClearCompletionError.tsx    # Client component — clears ?error from URL
│   │   └── session/[id]/page.tsx
│   ├── chat/page.tsx
│   ├── holiday/page.tsx
│   ├── profile/page.tsx
│   └── api/
│       ├── generate-plan/route.ts
│       ├── chat/route.ts
│       ├── youtube/route.ts
│       └── holiday-plan/route.ts
├── components/
│   ├── ui/
│   ├── WorkoutCard.tsx
│   ├── ExerciseItem.tsx
│   ├── ChatBubble.tsx
│   ├── OnboardingWizard.tsx
│   └── HolidayBanner.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── gemini.ts
│   ├── youtube.ts
│   └── sessionCompletion.ts           # Shared Supabase helper for marking sessions complete
├── supabase/migrations/001_initial.sql
├── types/index.ts
└── .env.local.example
```

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `YOUTUBE_API_KEY`

### 3) Set up Supabase

1. Create a Supabase project.
2. In the SQL editor, run `supabase/migrations/001_initial.sql`.
3. Enable auth providers:
   - Email/password
   - Google OAuth (configure callback URLs for local + production)
4. Copy project URL and anon key into `.env.local`.

### 4) Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## API routes

- `POST /api/generate-plan` – generates a workout plan, enriches exercises with YouTube links, and optionally saves to Supabase
- `GET /api/youtube?query=...` – returns top YouTube video ID + thumbnail
- `POST /api/chat` – sends a user message to Gemini and stores the exchange when authenticated
- `POST /api/holiday-plan` – generates temporary bodyweight-focused holiday training guidance

## Session completion

Sessions are marked complete via a Next.js Server Action (`app/dashboard/actions.ts`). The action:

1. Validates the `sessionId` is a well-formed UUID.
2. Verifies the requesting user owns the session (enforced in Supabase via `user_id` filter and RLS).
3. Updates `completed = true` and `completed_at` in the `sessions` table.
4. Revalidates `/dashboard` and `/dashboard/session/[id]`.
5. On failure, redirects back to the originating page with a typed `?error=<code>` query param that is displayed as an inline banner and then automatically removed from the URL.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add the same environment variables used in `.env.local`.
4. Set production auth callback URLs in Supabase.
5. Deploy.

## Notes

- The app is written in British English.
- The default dark theme uses a deep navy background and orange accents.
- Gemini and YouTube routes gracefully return fallback data if API keys are missing.
- The `ClearCompletionError` component uses `useSearchParams` and requires a `Suspense` boundary in the layout (or a wrapping boundary at the route level) to avoid a static-generation warning in Next.js 14.
