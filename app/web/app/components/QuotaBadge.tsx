'use client'

import { useEffect, useState } from 'react'

interface QuotaInfo {
  remaining: number
  total: number
  percentage: number
}

export function QuotaBadge({ tenantId }: { tenantId: string }) {
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuota()
  }, [tenantId])

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/entitlements', {
        headers: {
          'x-tenant-id': tenantId,
        },
      })

      if (!res.ok) throw new Error('Failed to fetch quota')
      const data = await res.json()

      setQuota({
        remaining: data.quota_remaining,
        total: data.quota_total,
        percentage: Math.round(
          (data.quota_remaining / data.quota_total) * 100
        ),
      })
    } catch (error) {
      console.error('Error fetching quota:', error)
      setQuota({
        remaining: 0,
        total: 10,
        percentage: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '4px 12px', backgroundColor: '#e5e7eb', borderRadius: '999px', fontSize: '12px', fontWeight: '500', color: '#666' }}>
        Loading...
      </div>
    )
  }

  if (!quota) {
    return null
  }

  const getColor = () => {
    if (quota.percentage > 50) return { bg: '#dcfce7', text: '#166534' }
    if (quota.percentage > 20) return { bg: '#fef3c7', text: '#92400e' }
    return { bg: '#fee2e2', text: '#991b1b' }
  }

  const color = getColor()

  return (
    <div style={{ padding: '4px 12px', backgroundColor: color.bg, borderRadius: '999px', fontSize: '12px', fontWeight: '500', color: color.text }}>
      ✨ {quota.remaining} / {quota.total} summaries
    </div>
  )
}
