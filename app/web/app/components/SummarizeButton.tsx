'use client'

import { useState } from 'react'

interface Activity {
  id: string
  type: string
  body: string
  created_at: string
  event_type: string
}

interface SummaryResult {
  summary: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  next_action: string
  units_used: number
  quota_remaining: number
  quota_total: number
}

interface SummarizeButtonProps {
  contactId: string
  activities: Activity[]
  tenantId: string
  onSummaryReceived?: (summary: SummaryResult) => void
}

export function SummarizeButton({
  contactId,
  activities,
  tenantId,
  onSummaryReceived,
}: SummarizeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<SummaryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSummarize = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactId, activities }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate summary')
      }

      const data = await res.json()
      setSummary(data)
      onSummaryReceived?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating summary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        onClick={handleSummarize}
        disabled={loading || activities.length === 0}
        style={{
          padding: '10px 16px',
          backgroundColor: loading ? '#e0e0e0' : '#2563eb',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          cursor: loading ? 'wait' : 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        {loading ? '⏳ Generating...' : '✨ Generate Summary'}
      </button>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee', borderRadius: '6px', color: '#c33', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {summary && (
        <div style={{ padding: '16px', backgroundColor: '#f0f4ff', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>Summary</h4>
          <ul style={{ fontSize: '13px', color: '#333', lineHeight: '1.6', listStylePosition: 'inside' }}>
            {summary.summary.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
            <strong>Next Action:</strong> {summary.next_action}
          </p>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            Quota: {summary.quota_remaining}/{summary.quota_total} remaining
          </p>
        </div>
      )}
    </div>
  )
}
