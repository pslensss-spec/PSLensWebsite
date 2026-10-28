# PSLens — Studio Booking

Mobile-style web app for booking PSLens studio shoot slots.

## Stack

- Vite + React + TypeScript
- Supabase (Auth, Postgres, RLS)
- Netlify Functions (bookings, contact, geo)
- Discord webhooks · Resend email · ipgeolocation.io

## Local setup

```bash
npm install
cp .env.example .env
# fill VITE_SUPABASE_* and function secrets
npm run dev
```

With the Netlify Vite plugin, `/api/*` functions run during `npm run dev`.

## Environment

See [`.env.example`](.env.example). Browser needs only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. All other keys stay on the server (Netlify env).

## Tabs

| Route | Screen |
|-------|--------|
| `/` | Home — calendar + slot picker |
| `/bookings` | Your bookings |
| `/contact` | Contact form |
| `/auth` | Magic-link sign-in |

## Deploy

1. Push to GitHub (`pslensss-spec/PSLensWebsite`)
2. Connect the repo in Netlify
3. Set environment variables
4. Deploy

Supabase Auth → URL configuration: add your Netlify URL to Site URL and Redirect URLs.
