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
      <div className="px-3 py-1 bg-gray-200 rounded-full animate-pulse">
        <span className="text-xs font-medium text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!quota) {
    return null
  }

  const getColor = () => {
    if (quota.percentage > 50) return 'bg-green-100 text-green-800'
    if (quota.percentage > 20) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getColor()}`}>
      ✨ {quota.remaining} / {quota.total} summaries
    </div>
  )
}
