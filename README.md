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

1. Repo: [sumanthnetworks93/PSLensWebsite](https://github.com/sumanthnetworks93/PSLensWebsite)  
   (`pslensss-spec/PSLensWebsite` is linked as remote `pslensss-spec` — grant push access or transfer when ready)
2. Connect the repo in Netlify
3. Set environment variables from `.env.example` (include `SUPABASE_SERVICE_ROLE_KEY`)
4. Deploy

Supabase Auth → URL configuration: add your Netlify URL (and `http://localhost:5173`) to Site URL and Redirect URLs.

### Supabase project

- Project: **PSLens** (`oqigxoqkrxvikgzdyhgb`)
- URL: `https://oqigxoqkrxvikgzdyhgb.supabase.co`
