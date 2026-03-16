'use client'

import { useEffect, useState } from 'react'
import { SummarizeButton } from './SummarizeButton'

interface Activity {
  id: string
  type: string
  body: string
  created_at: string
  event_type: string
}

interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  status: string
  created_at: string
}

export function ContactDetail({
  contactId,
  tenantId,
  onBack,
}: {
  contactId: string
  tenantId: string
  onBack: () => void
}) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [timeline, setTimeline] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContactAndTimeline()
  }, [contactId, tenantId])

  const fetchContactAndTimeline = async () => {
    try {
      setLoading(true)

      // Fetch contact
      const contactRes = await fetch(`/api/contacts/${contactId}`, {
        headers: {
          'x-tenant-id': tenantId,
        },
      })
      if (!contactRes.ok) throw new Error('Failed to fetch contact')
      const contactData = await contactRes.json()
      setContact(contactData)

      // Fetch timeline
      const timelineRes = await fetch(
        `/api/contacts/${contactId}/timeline`,
        {
          headers: {
            'x-tenant-id': tenantId,
          },
        }
      )
      if (!timelineRes.ok) throw new Error('Failed to fetch timeline')
      const timelineData = await timelineRes.json()
      setTimeline(timelineData.timeline)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
          <div className="space-y-3 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600">Contact not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-700 mb-4 text-sm font-medium"
        >
          ← Back
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
            {contact.email && (
              <p className="text-gray-600">{contact.email}</p>
            )}
            {contact.phone && (
              <p className="text-gray-600">{contact.phone}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Created {new Date(contact.created_at).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              contact.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {contact.status}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* AI Summary Section */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            AI Summary
          </h2>
          <SummarizeButton
            contactId={contactId}
            activities={timeline}
            tenantId={tenantId}
          />
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Timeline ({timeline.length})
          </h2>
        </div>

        {timeline.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">
              No activities yet. Log your first interaction!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {timeline.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                    {item.type === 'activity'
                      ? item.body?.charAt(0) || '📋'
                      : '🏠'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">
                          {item.type === 'activity'
                            ? `${item.body || 'Activity'}`
                            : `Showing`}
                        </p>
                        {item.type === 'activity' && item.body && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.body}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
