import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const claudeApiKey = process.env.CLAUDE_API_KEY || ''

interface Task {
  title: string
  priority: 'high' | 'medium' | 'low'
  due_days: number
  description?: string
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
    const body = await request.json()

    if (!body.contact_name || !body.activities) {
      return NextResponse.json(
        { error: 'contact_name and activities required' },
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

    // Check quota (task generation costs 1 unit)
    const { data: usage, error: usageError } = await supabase
      .from('ai_usage')
      .select('units')
      .eq('tenant_id', tenantId)
      .gte('created_at', entitlements.ai_quota_period_start)
      .lte('created_at', entitlements.ai_quota_period_end)

    if (usageError) throw usageError

    const totalUsed = (usage || []).reduce((sum, row) => sum + row.units, 0)
    const units = 1
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

    // Build prompt
    const activitiesText = body.activities
      .map((a: any) => `${a.type}: ${a.body}`)
      .join('\n')

    const prompt = `You are a real estate agent assistant. Analyze the activities with ${body.contact_name} and suggest follow-up tasks.

Recent Activities:
${activitiesText}

Based on the activities, generate 2-3 actionable follow-up tasks. Return JSON:
[
  {
    "title": "Task title (e.g., 'Send comparison analysis')",
    "priority": "high|medium|low",
    "due_days": 1-14,
    "description": "Brief description"
  }
]

Use high priority for urgent items (finance approval, inspection reports, etc).
Use medium for standard follow-ups (checking in, sending docs).
Use low for optional touches (thank you, additional info).
`

    // Call Claude Sonnet
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
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
    let tasks: Task[] = []

    try {
      const jsonStr = claudeResponse.content[0].text
      // Extract JSON array from response
      const match = jsonStr.match(/\[[\s\S]*\]/)
      if (match) {
        tasks = JSON.parse(match[0])
      }
    } catch {
      // Fallback tasks
      tasks = [
        {
          title: 'Follow up with client',
          priority: 'medium',
          due_days: 3,
          description: 'Check in on recent activities',
        },
      ]
    }

    // Log usage
    const { error: logError } = await supabase.from('ai_usage').insert({
      tenant_id: tenantId,
      feature: 'generate_tasks',
      units,
      cost_estimate: 0.0001,
      request_id: crypto.randomUUID(),
    })

    if (logError) throw logError

    return NextResponse.json({
      tasks,
      units_used: units,
      quota_remaining: quotaRemaining - units,
      quota_total: entitlements.ai_quota,
    })
  } catch (error: any) {
    console.error('Error generating tasks:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate tasks' },
      { status: 500 }
    )
  }
}
