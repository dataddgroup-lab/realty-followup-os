-- Row Level Security (RLS) - Strict Tenant Isolation
-- Every business table is scoped to tenant_id

-- Helper function to get current tenant
CREATE OR REPLACE FUNCTION get_current_tenant() RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'tenant_id')::uuid;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Contacts RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY contacts_tenant_isolation ON contacts
  FOR ALL
  USING (tenant_id = get_current_tenant())
  WITH CHECK (tenant_id = get_current_tenant());

-- Activities RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY activities_tenant_isolation ON activities
  FOR ALL
  USING (tenant_id = get_current_tenant())
  WITH CHECK (tenant_id = get_current_tenant());

-- Showings RLS
ALTER TABLE showings ENABLE ROW LEVEL SECURITY;

CREATE POLICY showings_tenant_isolation ON showings
  FOR ALL
  USING (tenant_id = get_current_tenant())
  WITH CHECK (tenant_id = get_current_tenant());

-- Tenant Users RLS
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_users_tenant_isolation ON tenant_users
  FOR ALL
  USING (tenant_id = get_current_tenant())
  WITH CHECK (tenant_id = get_current_tenant());

-- Tenant Entitlements RLS
ALTER TABLE tenant_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY entitlements_tenant_isolation ON tenant_entitlements
  FOR ALL
  USING (tenant_id = get_current_tenant())
  WITH CHECK (tenant_id = get_current_tenant());

-- AI Usage RLS
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_usage_tenant_isolation ON ai_usage
  FOR ALL
  USING (tenant_id = get_current_tenant())
  WITH CHECK (tenant_id = get_current_tenant());

-- Tenants table (allow reading own tenant info)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_read_own ON tenants
  FOR SELECT
  USING (id = get_current_tenant());

CREATE POLICY tenants_update_own ON tenants
  FOR UPDATE
  USING (id = get_current_tenant())
  WITH CHECK (id = get_current_tenant());

-- Users table (allow reading own profile)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_read_own ON users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
