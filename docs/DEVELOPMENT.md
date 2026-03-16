# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier OK)
- Claude API key

### Local Setup

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd realty-followup-os
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd app/web && npm install
   cd ../..
   ```

3. **Set up environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your keys
   ```

4. **Initialize Supabase**
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

5. **Start development server**
   ```bash
   cd app/web
   npm run dev
   # Open http://localhost:3000
   ```

## Project Structure

```
realty-followup-os/
├── app/web/                 Next.js application
│   ├── app/
│   │   ├── api/            Server routes
│   │   ├── components/     React components
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
├── supabase/
│   └── migrations/         Database migrations
├── docs/                   Documentation
├── SPEC.json              Project specification
├── package.json           Root package.json
└── .env.local.example     Environment template
```

## Development Workflow

### Feature Development

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Update components
   - Add API routes
   - Add migrations if needed

3. **Run type check**
   ```bash
   npm run type-check
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **Test locally**
   ```bash
   npm run dev
   # Test in browser at http://localhost:3000
   ```

6. **Commit**
   ```bash
   git add .
   git commit -m "Feature: description"
   ```

7. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

### Database Changes

1. **Create migration**
   ```bash
   supabase migration new add_new_table
   ```

2. **Edit migration** (in `supabase/migrations/`)
   ```sql
   CREATE TABLE new_table (
     id UUID PRIMARY KEY,
     tenant_id UUID REFERENCES tenants(id),
     ...
   );
   
   ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
   CREATE POLICY new_table_isolation ON new_table ...;
   ```

3. **Test locally**
   ```bash
   supabase db push
   ```

4. **Verify RLS**
   ```bash
   # In Supabase dashboard: SQL Editor
   SELECT * FROM new_table;  # Should return 0 rows
   ```

## Common Tasks

### Add a New Contact Field

1. **Create migration**
   ```sql
   ALTER TABLE contacts ADD COLUMN company TEXT;
   ```

2. **Update API route**
   ```typescript
   // app/api/contacts/route.ts
   const { name, email, phone, company } = body;
   ```

3. **Update UI**
   ```typescript
   // app/components/ContactsList.tsx
   <input placeholder="Company" />
   ```

### Add a New API Endpoint

1. **Create route file**
   ```bash
   touch app/api/new-endpoint/route.ts
   ```

2. **Implement handler**
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   
   export async function GET(request: NextRequest) {
     const tenantId = request.headers.get('x-tenant-id')
     // ... logic
     return NextResponse.json(data)
   }
   ```

3. **Call from frontend**
   ```typescript
   const res = await fetch('/api/new-endpoint', {
     headers: { 'x-tenant-id': tenantId }
   })
   ```

### Add a New Component

1. **Create component file**
   ```bash
   touch app/components/NewComponent.tsx
   ```

2. **Implement**
   ```typescript
   export function NewComponent() {
     return <div>...</div>
   }
   ```

3. **Use in page**
   ```typescript
   import { NewComponent } from './components/NewComponent'
   
   export default function Home() {
     return <NewComponent />
   }
   ```

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Create contact
- [ ] Edit contact
- [ ] Delete contact
- [ ] View timeline
- [ ] Add activity
- [ ] Click summarize
- [ ] Check quota updated
- [ ] Test with >10 summaries (quota exceeded)

## Debugging

### TypeScript Errors

```bash
npm run type-check
# Shows type issues
```

### Build Errors

```bash
npm run build
# Shows build issues
```

### Runtime Errors

Check browser console (F12 → Console tab)

### RLS Issues

```sql
-- In Supabase SQL Editor
SELECT * FROM contacts;
-- If returns 0 rows (and you have data), RLS is working
```

### API Issues

1. Check `x-tenant-id` header is set
2. Check Supabase keys in `.env.local`
3. Check Claude API key is valid
4. Check RLS policies are correct

## Performance Tips

1. **Use indexes** — Already configured for common queries
2. **Lazy load** — Timeline fetches on detail view, not list
3. **Cache quota** — Updates on page load, good enough
4. **Pagination** — Contact list can add pagination later
5. **Batch operations** — Log multiple activities in one call

## Code Style

### TypeScript

- Strict mode enabled
- No `any` types
- Explicit return types on functions

### React

- Functional components only
- Hooks for state management
- Props are typed

### Styling

- Tailwind CSS utilities
- Component-level CSS in globals.css
- No inline styles

## Commit Message Convention

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add/update tests
chore: dependency updates
```

Example:
```
feat: add auto-tasks feature
- Claude suggests follow-up tasks
- Scores by priority
- User can assign to self or team
```

## Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Migrations applied
- [ ] Environment variables set
- [ ] RLS policies verified
- [ ] API routes tested
- [ ] UI looks good on mobile
- [ ] No console errors

## Useful Commands

```bash
# Development
npm run dev                   # Start dev server
npm run type-check          # Check TypeScript
npm run build               # Build for production
npm start                   # Start production server

# Database
supabase db push            # Apply migrations
supabase db pull            # Pull schema changes
supabase db diff --dry      # Preview changes

# Testing
npm test                    # Run unit tests
npm run test:e2e           # Run E2E tests
npm run test:watch         # Watch mode

# Styling
npm run lint                # Run ESLint
```

## Troubleshooting

### "Module not found" Error

```bash
rm -rf node_modules
npm install
```

### "Port 3000 already in use"

```bash
npm run dev -- -p 3001
```

### "Supabase connection failed"

1. Check `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
2. Verify project exists on supabase.com
3. Try: `supabase link --project-ref <ref>`

### "Claude API error"

1. Check `CLAUDE_API_KEY` is valid
2. Key should start with `sk-`
3. Check API key has quota

### "RLS blocks all queries"

Common causes:
- Tenant ID not set in header
- Tenant doesn't exist in tenants table
- RLS policy has wrong logic
- Current tenant session not set

Fix:
```sql
-- Check RLS policies exist
SELECT * FROM pg_policies WHERE tablename = 'contacts';

-- Check tenant exists
SELECT * FROM tenants;

-- Check user is in tenant_users
SELECT * FROM tenant_users;
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Claude API Docs](https://docs.anthropic.com)

## Getting Help

- Check docs/ folder
- Review SPEC.json for architecture
- Look at similar components
- Check git commit history for examples
