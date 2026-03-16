-- Quota System - Trial & Entitlements

-- Enable trial for new tenants
CREATE OR REPLACE FUNCTION enable_trial_for_tenant(tenant_id_param UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO tenant_entitlements (
    tenant_id,
    ai_enabled,
    ai_quota,
    ai_quota_period_start,
    ai_quota_period_end
  ) VALUES (
    tenant_id_param,
    true,
    10,
    now(),
    now() + interval '30 days'
  )
  ON CONFLICT (tenant_id) DO UPDATE
  SET
    ai_enabled = true,
    ai_quota = 10,
    ai_quota_period_start = now(),
    ai_quota_period_end = now() + interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check quota remaining
CREATE OR REPLACE FUNCTION get_quota_remaining(tenant_id_param UUID)
RETURNS TABLE(quota_remaining BIGINT, quota_total BIGINT) AS $$
DECLARE
  total_quota BIGINT;
  used_quota BIGINT;
BEGIN
  SELECT ai_quota INTO total_quota
  FROM tenant_entitlements
  WHERE tenant_id = tenant_id_param;

  SELECT COALESCE(SUM(units), 0) INTO used_quota
  FROM ai_usage
  WHERE tenant_id = tenant_id_param
    AND created_at >= (
      SELECT ai_quota_period_start FROM tenant_entitlements
      WHERE tenant_id = tenant_id_param
    );

  RETURN QUERY SELECT
    GREATEST(0, total_quota - used_quota),
    total_quota;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-enable trial on tenant creation (trigger)
CREATE OR REPLACE FUNCTION enable_trial_on_new_tenant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tenant_entitlements (
    tenant_id,
    ai_enabled,
    ai_quota,
    ai_quota_period_start,
    ai_quota_period_end
  ) VALUES (
    NEW.id,
    true,
    10,
    now(),
    now() + interval '30 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enable_trial_on_tenant_create
  AFTER INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION enable_trial_on_new_tenant();
