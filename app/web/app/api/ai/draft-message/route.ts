import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const claudeApiKey = process.env.CLAUDE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant ID' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    if (!body.contact_name || !body.contact_email || !body.context) {
      return NextResponse.json(
        { error: 'contact_name, contact_email, and context required' },
        { status: 400 }
      )
    }

    // Check entitlements
    const { data: entitlements, error: entError } = await supabase
      .from('tenant_entitlements')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (entError || !entitlements) {
      return NextResponse.json(
        { error: 'Entitlements not found' },
        { status: 404 }
      )
    }

    if (!entitlements.ai_enabled) {
      return NextResponse.json(
        { error: 'AI not enabled for this tenant' },
        { status: 402 }
      )
    }

    // Check quota (draft messages cost 2 units)
    const { data: usage, error: usageError } = await supabase
      .from('ai_usage')
      .select('units')
      .eq('tenant_id', tenantId)
      .gte('created_at', entitlements.ai_quota_period_start)
      .lte('created_at', entitlements.ai_quota_period_end)

    if (usageError) throw usageError

    const totalUsed = (usage || []).reduce((sum, row) => sum + row.units, 0)
    const units = 2 // Draft messages cost 2 units (more expensive than summaries)
    const quotaRemaining = entitlements.ai_quota - totalUsed

    if (quotaRemaining <= units) {
      return NextResponse.json(
        {
          error: 'Insufficient quota for draft message',
          quota_remaining: quotaRemaining,
          quota_total: entitlements.ai_quota,
        },
        { status: 429 }
      )
    }

    // Build prompt
    const prompt = `You are a professional real estate agent assistant. Draft a personalized email to ${body.contact_name}.

Context:
${body.context}

Requirements:
- Professional but friendly tone
- Personalized (use their name)
- Clear call to action
- 3-5 sentences max
- Ready to send (no [brackets] or templates)

Return ONLY the email body (no subject line).`

    // Call Claude Sonnet (better for writing)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Claude API error: ${error.message}`)
    }

    const claudeResponse = await response.json()
    const draft = claudeResponse.content[0].text

    // Log usage
    const { error: logError } = await supabase.from('ai_usage').insert({
      tenant_id: tenantId,
      feature: 'draft_message',
      units,
      cost_estimate: 0.0003,
      request_id: crypto.randomUUID(),
    })

    if (logError) throw logError

    return NextResponse.json({
      draft,
      units_used: units,
      quota_remaining: quotaRemaining - units,
      quota_total: entitlements.ai_quota,
    })
  } catch (error: any) {
    console.error('Error drafting message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to draft message' },
      { status: 500 }
    )
  }
}
