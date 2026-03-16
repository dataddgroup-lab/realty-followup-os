'use client'

import { useState } from 'react'

interface DraftResult {
  draft: string
  tone: string
  units_used: number
  quota_remaining: number
}

interface DraftMessageButtonProps {
  contactId: string
  contactName: string
  tenantId: string
}

export function DraftMessageButton({ contactId, contactName, tenantId }: DraftMessageButtonProps) {
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<DraftResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDraft = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/ai/draft-message', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactId, contactName }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to draft message')
      }

      const data = await res.json()
      setDraft(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error drafting message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        onClick={handleDraft}
        disabled={loading}
        style={{
          padding: '10px 16px',
          backgroundColor: loading ? '#e0e0e0' : '#059669',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          cursor: loading ? 'wait' : 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        {loading ? '⏳ Drafting...' : '📧 Draft Message'}
      </button>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee', borderRadius: '6px', color: '#c33', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {draft && (
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>Draft Message</h4>
          <p style={{ fontSize: '13px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{draft.draft}</p>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            Tone: {draft.tone} • Quota: {draft.quota_remaining} remaining
          </p>
        </div>
      )}
    </div>
  )
}
