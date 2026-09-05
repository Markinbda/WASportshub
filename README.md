# Warwick Bears Athletics Hub

Public athletics website and staff management workspace for Warwick Academy. The application publishes sports, teams, privacy-safe rosters, fixtures, results, news, approved media, historical seasons, and Hall of Fame profiles.

Production: https://wasportshub.netlify.app

## Stack

- React 19, TypeScript, Vite, Tailwind CSS
- Supabase Postgres, Auth, Row Level Security, and Storage
- Netlify hosting, Functions, and scheduled Functions
- SendGrid for opt-in fixture reminder email

## Local Development

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Use `netlify dev` when testing Netlify Functions locally. Local Supabase requires Docker; remote development can use the linked project and `.env.local`.

## Commands

```powershell
pnpm lint
pnpm build
netlify build
supabase db push
supabase gen types typescript --linked
```

## Environment

Browser build variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server-only Netlify Function variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `REMINDER_TOKEN_SECRET`

Never expose the service-role key or SendGrid key through a `VITE_*` variable.

## Staff Roles

- `coach`: manages fixtures, results, rosters, and media for assigned sports or teams.
- `editor`: global content management, including teams, news, media approval, archives, and Hall of Fame.
- `admin`: editor access plus staff invitations and coach scope assignment.

Authorization is enforced by Supabase RLS. Public roster names are returned through `get_public_roster()` according to each team's configured privacy mode.

## Functions

- `admin-invite`: admin-authorized Supabase Auth invitations.
- `reminder-subscribe`: double-opt-in fixture reminder registration.
- `reminder-verify`: verifies reminder email ownership.
- `reminder-unsubscribe`: one-click reminder opt-out.
- `send-reminders`: scheduled every 15 minutes; sends due reminders through SendGrid and records deliveries.

## Deployment

```powershell
supabase db push
pnpm lint
netlify build
git push
netlify deploy --prod --build
```

Vite variables must include Netlify's `builds` scope. Function secrets need the `functions` and `runtime` scopes.

## Initial Operations

1. Create the first Supabase Auth user and corresponding active `staff_profiles` row with role `admin`.
2. Verify a sender in SendGrid and configure `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` in Netlify.
3. Sign in at `/admin` and create current teams, fixtures, rosters, news, and approved media.
