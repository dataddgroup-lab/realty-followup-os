'use client'

import { useState } from 'react'

interface Activity {
  id: string
  type: string
  body: string
  created_at: string
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
        body: JSON.stringify({
          contact_id: contactId,
          activities: activities.map((a) => ({
            type: a.type,
            body: a.body,
            created_at: a.created_at,
          })),
        }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setError('Quota exceeded. Upgrade to get more summaries.')
        return
      }

      if (res.status === 402) {
        setError('AI not enabled. Upgrade your plan.')
        return
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to summarize')
      }

      const data: SummaryResult = await res.json()
      setSummary(data)
      onSummaryReceived?.(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleSummarize}
        disabled={loading || activities.length === 0}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? '✨ Summarizing...' : '✨ AI Summary'}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {summary && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
            <ul className="space-y-1">
              {summary.summary.map((point, i) => (
                <li key={i} className="text-sm text-gray-700">
                  • {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-blue-200">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Sentiment</p>
              <p className="font-medium text-gray-900">
                {summary.sentiment.charAt(0).toUpperCase() +
                  summary.sentiment.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Next Action</p>
              <p className="font-medium text-gray-900 max-w-xs">
                {summary.next_action}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Quota Used</p>
            <p className="text-sm text-gray-700">
              {summary.units_used} unit • {summary.quota_remaining} remaining
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
