import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant ID' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get entitlements
    const { data: ent, error: entError } = await supabase
      .from('tenant_entitlements')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (entError) throw entError
    if (!ent) {
      return NextResponse.json(
        { error: 'Entitlements not found' },
        { status: 404 }
      )
    }

    // Get usage for current period
    const { data: usage, error: usageError } = await supabase
      .from('ai_usage')
      .select('units')
      .eq('tenant_id', tenantId)
      .gte('created_at', ent.ai_quota_period_start)
      .lte('created_at', ent.ai_quota_period_end)

    if (usageError) throw usageError

    const totalUsed = (usage || []).reduce((sum, row) => sum + row.units, 0)
    const quotaRemaining = Math.max(0, ent.ai_quota - totalUsed)

    return NextResponse.json({
      ai_enabled: ent.ai_enabled,
      quota_total: ent.ai_quota,
      quota_used: totalUsed,
      quota_remaining: quotaRemaining,
      period_start: ent.ai_quota_period_start,
      period_end: ent.ai_quota_period_end,
      plan: 'trial', // will be paid plans later
    })
  } catch (error: any) {
    console.error('Error fetching entitlements:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch entitlements' },
      { status: 500 }
    )
  }
}
