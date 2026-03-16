# Realty Follow-Up OS (RFUOS)

Multi-tenant CRM for real estate agents with AI-assisted contact summaries.

## What It Does

- **Manage Contacts** — Create, view, edit contacts with properties they're interested in
- **Timeline View** — See all activities (calls, emails, meetings, showings) in one place
- **AI Summaries** — 1-click AI summary of recent contact interactions (uses Claude Haiku)
- **Multi-Tenant** — Secure tenant isolation with RLS (Row Level Security)
- **Quota System** — Trial: 10 free summaries. Upgrade for more.

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd realty-followup-os
cd app/web
npm install
```

### 2. Set Up Supabase

- Create account at https://supabase.com
- New project → copy project URL + keys
- Copy `.env.local.example` to `.env.local`
- Add Supabase URL + anon key + service role key

```bash
# From root folder
supabase db push --project-ref <your-project-ref>
```

### 3. Add Claude API Key

- Get API key from https://console.anthropic.com
- Add `CLAUDE_API_KEY=sk-...` to `.env.local`

### 4. Run Locally

```bash
cd app/web
npm run dev
# Open http://localhost:3000
```

## Architecture

- **Frontend:** Next.js 16 (App Router), React 18, TypeScript, Tailwind
- **Backend:** Supabase (Auth + Postgres + RLS)
- **AI:** Claude Haiku (for summaries)
- **Security:** Row Level Security (tenant isolation)

## Deployment

See `docs/DEPLOY.md` for step-by-step guide to deploy on Vercel + Supabase.

## Features

- ✅ Contact CRUD (create, read, update, delete)
- ✅ Activity timeline (manual entry)
- ✅ AI summaries (1-click)
- ✅ Quota system (trial 10, then paid)
- ✅ Multi-tenant secure (RLS)
- ✅ Responsive UI (mobile, tablet, desktop)

## Future Roadmap

- Draft email generation (with approval)
- Auto-task generation
- Usage dashboard
- Advanced filtering
- Stripe integration (billing)

## Testing

```bash
npm test                    # Run jest
npm run test:e2e           # Run playwright E2E
```

## Support

For questions or issues, contact the developer.
