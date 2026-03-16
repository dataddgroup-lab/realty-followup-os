'use client'

import { useEffect, useState } from 'react'
import { SummarizeButton } from './SummarizeButton'
import { DraftMessageButton } from './DraftMessageButton'
import { GenerateTasksButton } from './GenerateTasksButton'

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

export function ContactDetailWithAI({
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
  const [activeTab, setActiveTab] = useState<'timeline' | 'ai'>('timeline')

  useEffect(() => {
    fetchContactAndTimeline()
  }, [contactId, tenantId])

  const fetchContactAndTimeline = async () => {
    try {
      setLoading(true)

      const contactRes = await fetch(`/api/contacts/${contactId}`, {
        headers: {
          'x-tenant-id': tenantId,
        },
      })
      if (!contactRes.ok) throw new Error('Failed to fetch contact')
      const contactData = await contactRes.json()
      setContact(contactData)

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
      <div className="bg-white rounded-xl border border-gray-200 p-8 card-shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center card-shadow">
        <p className="text-gray-600">Contact not found</p>
        <button
          onClick={onBack}
          className="mt-4 btn-secondary"
        >
          Back
        </button>
      </div>
    )
  }

  const activitiesForText = timeline.map(t => ({
    id: t.id,
    type: t.event_type,
    body: t.body || t.type,
    created_at: t.created_at,
    event_type: t.event_type
  }))

  const contextText = activitiesForText
    .map(a => `${a.type}: ${a.body}`)
    .join('\n')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 card-shadow">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 mb-4 text-sm font-medium flex items-center gap-1"
        >
          ← Back to Contacts
        </button>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
            {contact.email && (
              <p className="text-gray-600 mt-1">{contact.email}</p>
            )}
            {contact.phone && (
              <p className="text-gray-600">{contact.phone}</p>
            )}
            <p className="text-sm text-gray-500 mt-3">
              Added {new Date(contact.created_at).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              contact.status === 'active'
                ? 'badge-success'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {contact.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-shadow">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-4 px-6 font-medium transition ${
              activeTab === 'timeline'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📅 Timeline ({timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-4 px-6 font-medium transition ${
              activeTab === 'ai'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✨ AI Tools
          </button>
        </div>

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="divide-y divide-gray-200">
            {timeline.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">No activities logged yet</p>
              </div>
            ) : (
              timeline.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {item.event_type === 'activity' ? '📝' : '🏠'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 capitalize">
                        {item.event_type === 'activity'
                          ? item.body || 'Activity'
                          : 'Showing'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* AI Tools Tab */}
        {activeTab === 'ai' && (
          <div className="p-6 space-y-8">
            {/* Summary */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📊</span> Contact Summary
              </h3>
              {timeline.length > 0 ? (
                <SummarizeButton
                  contactId={contactId}
                  activities={activitiesForText}
                  tenantId={tenantId}
                />
              ) : (
                <p className="text-sm text-gray-600">Add activities to generate summary</p>
              )}
            </div>

            {/* Draft Message */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>✉️</span> Draft Email
              </h3>
              {contact.email ? (
                <DraftMessageButton
                  contactName={contact.name}
                  contactEmail={contact.email}
                  context={contextText || 'New contact follow-up'}
                  tenantId={tenantId}
                />
              ) : (
                <p className="text-sm text-gray-600">Add email address to draft messages</p>
              )}
            </div>

            {/* Auto Tasks */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>✓</span> Suggested Tasks
              </h3>
              {timeline.length > 0 ? (
                <GenerateTasksButton
                  contactName={contact.name}
                  activities={activitiesForText}
                  tenantId={tenantId}
                />
              ) : (
                <p className="text-sm text-gray-600">Add activities to generate tasks</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
