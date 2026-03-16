# RFUOS Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────┐
│          Next.js Frontend (Vercel)              │
│  App Router • React 18 • TypeScript • Tailwind │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────────┐   ┌─────▼──────────────┐
│ Supabase         │   │ AI Gateway         │
│ - Auth           │   │ - Entitlements     │
│ - Postgres       │   │ - Quota Enforce    │
│ - RLS            │   │ - Claude API       │
│ - Storage        │   │ - Usage Logging    │
└──────────────────┘   └────────────────────┘
```

## Components

### Frontend (Next.js)

**App Router Structure:**
```
app/
├── layout.tsx              Main layout (header, footer)
├── page.tsx                Dashboard (contacts list/detail switcher)
├── api/                    Server-side API routes
│   ├── contacts/           CRUD endpoints
│   ├── activities/         Activity logging
│   ├── ai/summarize        Claude integration
│   └── entitlements/       Quota checking
├── components/
│   ├── ContactsList.tsx    Main list view
│   ├── ContactDetail.tsx   Timeline + summary
│   ├── SummarizeButton.tsx AI button + results
│   └── QuotaBadge.tsx      Quota indicator
├── globals.css             Tailwind + animations
└── page.tsx                Home page
```

**Technology Stack:**
- Next.js 16 (App Router)
- React 18
- TypeScript (strict mode)
- Tailwind CSS 3.3
- Supabase JS client

### Backend (Supabase + Serverless)

**Database Schema:**
```
tenants                    (workspaces)
├─ id, name, plan
├─ tenant_users          (N:M, roles)
├─ contacts             (people)
│  ├─ activities        (interactions)
│  └─ showings          (properties)
├─ tenant_entitlements  (AI quotas)
└─ ai_usage            (cost tracking)
```

**Security:**
- Row-Level Security (RLS) on all business tables
- `tenant_id` enforced at database level
- Multi-tenant isolation verified with tests

**Key Tables:**
- `tenants`: Workspace/organization
- `users`: Global user registry
- `tenant_users`: User-to-tenant mapping with roles
- `contacts`: People agents follow up with
- `activities`: Calls, emails, meetings, notes
- `showings`: Property viewings
- `tenant_entitlements`: AI quota and plan info
- `ai_usage`: Usage tracking for billing

### AI Gateway

**Purpose:** Centralized control over AI access, quotas, and costs

**Responsibilities:**
1. Validate entitlements (ai_enabled check)
2. Check quota (hard limits)
3. Call Claude API
4. Log usage (for billing)
5. Return structured JSON

**Quota Enforcement:**
- Formula: `units = max(1, ceil(len(payload) / 500))`
- Check: `sum(ai_usage.units) < entitlements.ai_quota`
- Trial: 10 summaries per 30 days
- Hard limits (no partial calls)

**Cost Model:**
- Haiku: ~$0.0001 per summary
- Usage tracked in `ai_usage` table
- Trial period: 30 days, 10 summaries

## Data Flow

### Contact → Summary Flow

```
1. User views contact detail
2. Frontend fetches timeline (activities + showings)
3. User clicks "✨ Generate AI Summary"
4. POST /api/ai/summarize {contact_id, activities}
5. Server checks entitlements (ai_enabled? quota ok?)
6. Server calls Claude Haiku API
7. Claude returns structured JSON
8. Server logs usage (ai_usage table)
9. Frontend updates quota badge
10. Frontend displays summary to user
```

### Multi-Tenant Isolation

```
1. User signs in (tenant_id from JWT)
2. Server sets app.current_tenant session variable
3. All queries filtered by tenant_id
4. RLS policies enforce at database level
5. Tenant A cannot read Tenant B's data
6. Cross-tenant access returns 0 rows (no error leakage)
```

## API Contract

### Contacts Endpoint

```
GET /api/contacts
Headers: x-tenant-id: <uuid>
Response: Contact[]

POST /api/contacts
Headers: x-tenant-id: <uuid>
Body: {name, email, phone, status}
Response: Contact

PATCH /api/contacts/:id
Headers: x-tenant-id: <uuid>
Body: {name?, email?, phone?, status?}
Response: Contact

DELETE /api/contacts/:id
Headers: x-tenant-id: <uuid>
Response: {success: boolean}
```

### Timeline Endpoint

```
GET /api/contacts/:id/timeline
Headers: x-tenant-id: <uuid>
Response: {timeline: [activities + showings]}
```

### AI Summarize Endpoint

```
POST /api/ai/summarize
Headers: x-tenant-id: <uuid>
Body: {
  contact_id: string,
  activities: [{type, body, created_at}]
}
Response 200: {
  summary: [string],
  sentiment: "positive|neutral|negative",
  next_action: string,
  units_used: number,
  quota_remaining: number
}
Response 402: {error: "AI not enabled"}
Response 429: {error: "Quota exceeded"}
```

### Entitlements Endpoint

```
GET /api/entitlements
Headers: x-tenant-id: <uuid>
Response: {
  ai_enabled: boolean,
  quota_total: number,
  quota_used: number,
  quota_remaining: number,
  period_start: ISO8601,
  period_end: ISO8601
}
```

## Security Model

### RLS (Row-Level Security)

**Pattern:**
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY <table>_tenant_isolation ON <table>
  USING (tenant_id = get_current_tenant())
  WITH CHECK (tenant_id = get_current_tenant());
```

**Tables with RLS:**
- contacts
- activities
- showings
- tenant_users
- tenant_entitlements
- ai_usage

**Tenant Resolution:**
```typescript
function get_current_tenant(): UUID {
  return (auth.jwt() ->> 'tenant_id')::uuid;
}
```

### API Authentication

**Current (MVP):**
- x-tenant-id header (test mode)
- No JWT validation yet

**Production (Future):**
- JWT from Supabase auth
- tenant_id extracted from JWT
- Validate user is in tenant_users

## Performance Considerations

### Database Indexes

```sql
CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_showings_contact ON showings(contact_id);
CREATE INDEX idx_ai_usage_created ON ai_usage(created_at DESC);
```

### Caching

- Quota badge: Fetches on page load
- Contact list: Refetches on navigation
- Timeline: Fetches on contact detail open
- No aggressive caching (fresh data important)

### API Optimization

- Server-side filtering (tenant_id)
- Minimal JSON payloads
- Lazy loading (timeline fetched on click)

## Deployment

### Environments

**Development:**
- Local Next.js: `npm run dev`
- Local Supabase: `supabase start`
- Claude API key: set in `.env.local`

**Production:**
- Frontend: Vercel (App Router)
- Database: Supabase Postgres
- AI: Claude API (via serverless function)

### Environment Variables

**Required (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CLAUDE_API_KEY=sk-...
```

**Never commit secrets.**

## Extensibility

### Adding New Features

**Example: Auto-Tasks Feature**
1. Add `tasks` table to schema
2. Add RLS policies
3. Create `/api/tasks/generate` endpoint
4. Call Claude Sonnet with task prompt
5. Log usage (cost tracking)
6. Update UI to show tasks

**Example: Draft Messages**
1. Reuse AI Gateway pattern
2. Create `/api/ai/draft-message` endpoint
3. Require approval before send
4. Track usage (units = 2x summaries)

## Testing Strategy

### RLS Tests
```typescript
test('tenant A cannot read tenant B contacts', async () => {
  // Create 2 tenants, 1 contact each
  // Query as Tenant B
  // Assert returns 0 rows
});
```

### Quota Tests
```typescript
test('quota enforcement blocks overage', async () => {
  // Create tenant with quota=3
  // Make 3 calls (all pass)
  // Make 4th call
  // Assert 429 error
});
```

### E2E Tests
```typescript
test('contact → timeline → summary flow', async () => {
  // Create contact
  // Add activity
  // Call summarize
  // Assert result
  // Check ai_usage logged
});
```

## Monitoring & Observability

### Metrics to Track

- API response times
- Claude API latency
- Quota usage per tenant
- Error rates (402, 429, 500)
- Unique active tenants

### Logs to Capture

- All API calls (with tenant_id)
- AI usage (contact_id, units, cost)
- Errors (with stack traces)
- Authentication failures

## Future Roadmap

1. **Draft Messages** — Sonnet-powered email drafting
2. **Auto-Tasks** — AI suggests follow-up tasks
3. **Analytics Dashboard** — Usage tracking UI
4. **Stripe Integration** — Paid plans + billing
5. **Email Sync** — Import from Gmail/Outlook
6. **Mobile App** — React Native version
