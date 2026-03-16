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

  const sentimentEmoji = {
    positive: '😊',
    neutral: '😐',
    negative: '😔',
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleSummarize}
        disabled={loading || activities.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          loading
            ? 'bg-blue-100 text-blue-600 cursor-wait'
            : activities.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'btn-primary'
        }`}
      >
        {loading ? (
          <>
            <span className="animate-spin">⚙️</span>
            Analyzing...
          </>
        ) : (
          <>
            <span>✨</span>
            Generate AI Summary
          </>
        )}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg scale-in">
          <div className="flex gap-3">
            <span>⚠️</span>
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {summary && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg scale-in space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📋</span> Summary Points
            </h4>
            <ul className="space-y-2">
              {summary.summary.map((point, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                Sentiment
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {sentimentEmoji[summary.sentiment]}{' '}
                {summary.sentiment.charAt(0).toUpperCase() +
                  summary.sentiment.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                Next Action
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
                {summary.next_action}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
              Quota Used
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-blue-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{
                    width: `${(summary.units_used / summary.quota_total) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {summary.quota_remaining} left
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
