# Deployment Guide - Realty Follow-Up OS

This guide walks you through deploying RFUOS to Vercel + Supabase.

## Step 1: Create Supabase Project

1. Go to https://supabase.com and create an account
2. Create a new project:
   - Organization: Create new (or use existing)
   - Project name: `realty-followup-os`
   - Database password: (save securely!)
   - Region: Choose closest to you
   - Pricing: Free tier is fine

3. Wait for project to initialize (~2 min)

4. Go to **Settings → API**:
   - Copy `Project URL` → save as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → save as `SUPABASE_SERVICE_ROLE_KEY` (SECRET!)

## Step 2: Run Database Migrations

1. In your local repo, create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   CLAUDE_API_KEY=sk-your-claude-key
   ```

2. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

3. Run migrations:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

4. Verify in Supabase dashboard:
   - Go to **SQL Editor**
   - You should see tables: tenants, users, contacts, activities, showings, etc.

## Step 3: Get Claude API Key

1. Go to https://console.anthropic.com
2. Create API key
3. Add to `.env.local` as `CLAUDE_API_KEY=sk-...`

## Step 4: Deploy to Vercel

1. Push code to GitHub:
   ```bash
   cd ~/Projects/realty-followup-os
   git add .
   git commit -m "Initial RFUOS MVP"
   git remote add origin https://github.com/YOUR-USER/realty-followup-os.git
   git push -u origin main
   ```

2. Go to https://vercel.com and create account

3. Import project:
   - Click "New Project"
   - Select your GitHub repo
   - Framework: Next.js (auto-detected)
   - Root directory: `app/web`

4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key
   - `CLAUDE_API_KEY`: Your Claude API key

5. Deploy!

6. After deployment, you'll get a URL like:
   ```
   https://realty-followup-os.vercel.app
   ```

## Step 5: Enable Trial on New Tenant

1. In Supabase dashboard, go to **SQL Editor**

2. Run this query to create a test tenant:
   ```sql
   INSERT INTO tenants (name, plan) VALUES ('Test Realtor', 'trial');
   ```

3. Verify trial was auto-enabled:
   ```sql
   SELECT * FROM tenant_entitlements;
   ```
   Should show: ai_enabled=true, ai_quota=10

## Step 6: Test Locally First (Recommended)

```bash
cd app/web
npm install
npm run dev
# Open http://localhost:3000
```

Try:
- Create a contact
- Add an activity
- View timeline

## Troubleshooting

### "Missing SUPABASE_SERVICE_ROLE_KEY"
- Check .env.local has the key
- It should start with `eyJ...` (not a short key)

### "RLS violation"
- Make sure migrations were run: `supabase db push`
- Check that RLS policies exist in Supabase dashboard

### "Cannot reach Claude"
- Verify `CLAUDE_API_KEY` is correct
- Key should start with `sk-`

### "Vercel build fails"
- Check Node version (should be 18+)
- Check root directory is set to `app/web`
- Verify all env vars are set

## Next Steps

1. ✅ Deployed and live
2. Create test tenant
3. Invite realtor friend to test
4. Collect feedback for Phase 2 (AI summaries)
