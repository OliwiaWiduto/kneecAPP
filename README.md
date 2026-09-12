# kneecAPP

Learn Irish off Kneecap — YouTube lyric sync (English on top, Irish underneath) plus Duolingo-style 10-game lessons. Sign in with Supabase so XP and streak sit against your name.

## Dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase auth (streaks)

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Copy **Project URL** and the **publishable** (or legacy anon) key into `.env.local`.
3. In the SQL editor, run `supabase/migrations/20260912180000_create_profiles.sql`. That table stores `display_name`, XP, streak, and completed lessons per user.
4. Authentication → URL configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
5. For local testing, Authentication → Providers → Email → turn **Confirm email** off so sign-up drops you straight in.

Guest progress stays in the browser. Signing up or in merges that guest XP/streak into the named profile.

If Docker is installed you can run the stack locally instead:

```bash
npx supabase start
npx supabase db reset
```

Then point `.env.local` at the local API URL and anon key printed by `supabase start`.

## Tracks (prototype)

- H.O.O.D
- THE RECAP
- Guilty Conscience
- Get Your Brits Out
- Better Way to Live
- C.E.A.R.T.A

Lyric lines are educational timed excerpts for sync/teaching, not a licensed full lyric sheet. Spotify integration is planned for later.
