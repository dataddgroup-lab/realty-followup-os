import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant ID' },
        { status: 400 }
      )
    }

    // Fetch activities for this contact
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('contact_id', params.id)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (activitiesError) throw activitiesError

    // Fetch showings for this contact
    const { data: showings, error: showingsError } = await supabase
      .from('showings')
      .select('*')
      .eq('contact_id', params.id)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (showingsError) throw showingsError

    // Combine and sort by created_at
    const timeline = [
      ...(activities || []).map((a) => ({
        ...a,
        event_type: 'activity',
      })),
      ...(showings || []).map((s) => ({
        ...s,
        event_type: 'showing',
      })),
    ].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })

    return NextResponse.json({ timeline })
  } catch (error: any) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}
