import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const claudeApiKey = process.env.CLAUDE_API_KEY || ''

interface SummarizeRequest {
  contact_id: string
  activities: Array<{
    type: string
    body: string
    created_at: string
  }>
}

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
    const body: SummarizeRequest = await request.json()

    if (!body.contact_id || !body.activities) {
      return NextResponse.json(
        { error: 'contact_id and activities required' },
        { status: 400 }
      )
    }

    // Step 1: Check entitlements
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

    // Step 2: Check quota
    const { data: usage, error: usageError } = await supabase
      .from('ai_usage')
      .select('units')
      .eq('tenant_id', tenantId)
      .gte('created_at', entitlements.ai_quota_period_start)
      .lte('created_at', entitlements.ai_quota_period_end)

    if (usageError) throw usageError

    const totalUsed = (usage || []).reduce((sum, row) => sum + row.units, 0)
    const units = 1 // 1 unit per summary
    const quotaRemaining = entitlements.ai_quota - totalUsed

    if (quotaRemaining <= 0) {
      return NextResponse.json(
        {
          error: 'Quota exceeded',
          quota_remaining: 0,
          quota_total: entitlements.ai_quota,
        },
        { status: 429 }
      )
    }

    // Step 3: Build prompt
    const activitiesText = body.activities
      .map((a) => `${a.type}: ${a.body} (${new Date(a.created_at).toLocaleDateString()})`)
      .join('\n')

    const prompt = `You are a real estate agent assistant. Summarize the following contact interactions into a brief, actionable summary.

Activities:
${activitiesText}

Provide a JSON response with:
{
  "summary": ["point 1", "point 2", "point 3"],
  "sentiment": "positive" | "neutral" | "negative",
  "next_action": "recommended follow-up action"
}`

    // Step 4: Call Claude Haiku
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
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
    let result

    try {
      result = JSON.parse(claudeResponse.content[0].text)
    } catch {
      result = {
        summary: [claudeResponse.content[0].text],
        sentiment: 'neutral',
        next_action: 'Follow up soon',
      }
    }

    // Step 5: Log usage
    const { error: logError } = await supabase.from('ai_usage').insert({
      tenant_id: tenantId,
      feature: 'summarize',
      units,
      cost_estimate: 0.0001,
      request_id: crypto.randomUUID(),
    })

    if (logError) throw logError

    // Step 6: Return result
    return NextResponse.json({
      summary: result.summary,
      sentiment: result.sentiment,
      next_action: result.next_action,
      units_used: units,
      quota_remaining: quotaRemaining - units,
      quota_total: entitlements.ai_quota,
    })
  } catch (error: any) {
    console.error('Error in summarize:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to summarize' },
      { status: 500 }
    )
  }
}
