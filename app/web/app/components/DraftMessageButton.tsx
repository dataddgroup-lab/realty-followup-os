'use client'

import { useState } from 'react'

interface DraftMessageButtonProps {
  contactName: string
  contactEmail: string
  context: string
  tenantId: string
}

export function DraftMessageButton({
  contactName,
  contactEmail,
  context,
  tenantId,
}: DraftMessageButtonProps) {
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleDraftMessage = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/ai/draft-message', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_name: contactName,
          contact_email: contactEmail,
          context,
        }),
      })

      if (res.status === 429) {
        setError('Insufficient quota. Upgrade for more drafts.')
        return
      }

      if (res.status === 402) {
        setError('AI not enabled. Upgrade your plan.')
        return
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to draft message')
      }

      const data = await res.json()
      setDraft(data.draft)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (draft) {
      navigator.clipboard.writeText(draft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleDraftMessage}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          loading
            ? 'bg-purple-100 text-purple-600 cursor-wait'
            : 'btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
        }`}
      >
        {loading ? (
          <>
            <span className="animate-spin">⚙️</span>
            Drafting...
          </>
        ) : (
          <>
            <span>✉️</span>
            Draft Email
          </>
        )}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg scale-in">
          <div className="flex gap-3">
            <span>⚠️</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {draft && (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg scale-in space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📧</span> Email Draft
            </h4>
            <div className="bg-white p-4 rounded-lg border border-purple-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {draft}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                copied
                  ? 'bg-green-100 text-green-800'
                  : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => setDraft(null)}
              className="py-2 px-4 bg-white text-gray-900 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Clear
            </button>
          </div>

          <div className="pt-4 border-t border-purple-200 text-xs text-gray-600">
            💡 Tip: Copy the draft and paste into your email client. Review and customize
            before sending.
          </div>
        </div>
      )}
    </div>
  )
}
