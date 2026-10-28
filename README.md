# PSLens — Studio Booking

Mobile-style web app for booking PSLens studio shoot slots.

## Stack

- Vite + React + TypeScript
- **Google Forms** for collecting customer information (Contact)
- Netlify hosting
- Optional: Supabase / Netlify Functions if you re-enable live bookings later

## Local setup

```bash
npm install
cp .env.example .env
# set VITE_GOOGLE_FORM_URL to your form …/viewform link
npm run dev
```

## Environment

Required for Contact:

```
VITE_GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/…/viewform
```

Set the same variable in **Netlify → Site configuration → Environment variables**, then **Clear cache and deploy**.

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
