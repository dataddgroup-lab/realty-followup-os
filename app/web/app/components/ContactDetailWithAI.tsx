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
  const [activeTab, setActiveTab] = useState<'timeline' | 'ai'>('timeline')

  useEffect(() => {
    fetchContactAndTimeline()
  }, [contactId, tenantId])

  const fetchContactAndTimeline = async () => {
    try {
      setLoading(true)

      const contactRes = await fetch(`/api/contacts/${contactId}`, {
        headers: { 'x-tenant-id': tenantId },
      })
      if (!contactRes.ok) throw new Error('Failed to fetch contact')

      const contactData = await contactRes.json()
      setContact(contactData)

      const timelineRes = await fetch(`/api/contacts/${contactId}/timeline`, {
        headers: { 'x-tenant-id': tenantId },
      })
      if (!timelineRes.ok) throw new Error('Failed to fetch timeline')

      const timelineData = await timelineRes.json()
      setTimeline(timelineData)
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Error loading contact')
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivity = async (body: string, eventType: string) => {
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact_id: contactId, body, event_type: eventType }),
      })
      if (!res.ok) throw new Error('Failed to add activity')
      await fetchContactAndTimeline()
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Error adding activity')
    }
  }

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>Loading contact...</div>
  }

  if (!contact) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <p style={{ color: '#666' }}>Contact not found</p>
        <button
          onClick={onBack}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#666',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
          }}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          padding: '8px 16px',
          backgroundColor: '#e5e7eb',
          color: '#111',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '14px',
        }}
      >
        ← Back
      </button>

      {/* Contact Header */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>{contact.name}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px', fontSize: '14px' }}>
          <div>
            <p style={{ color: '#666' }}>Email</p>
            <p style={{ fontWeight: '500', color: '#111', marginTop: '4px' }}>{contact.email || 'N/A'}</p>
          </div>
          <div>
            <p style={{ color: '#666' }}>Phone</p>
            <p style={{ fontWeight: '500', color: '#111', marginTop: '4px' }}>{contact.phone || 'N/A'}</p>
          </div>
          <div>
            <p style={{ color: '#666' }}>Status</p>
            <p style={{ fontWeight: '500', color: '#111', marginTop: '4px' }}>{contact.status}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            padding: '12px 16px',
            backgroundColor: activeTab === 'timeline' ? '#2563eb' : 'transparent',
            color: activeTab === 'timeline' ? 'white' : '#666',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
          }}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          style={{
            padding: '12px 16px',
            backgroundColor: activeTab === 'ai' ? '#2563eb' : 'transparent',
            color: activeTab === 'ai' ? 'white' : '#666',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
          }}
        >
          AI Tools
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'timeline' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Add Activity */}
          <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '12px' }}>Add Activity</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleAddActivity('Called', 'call')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Call
              </button>
              <button
                onClick={() => handleAddActivity('Sent email', 'email')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Email
              </button>
              <button
                onClick={() => handleAddActivity('Meeting scheduled', 'meeting')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Meeting
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {timeline.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '24px' }}>No activities yet</p>
            ) : (
              timeline.map((activity) => (
                <div key={activity.id} style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
                  <div style={{ fontWeight: '500', color: '#111', fontSize: '14px' }}>{activity.type}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{activity.body}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {new Date(activity.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summarize */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '12px' }}>📊 Contact Summary</h3>
            {timeline.length > 0 ? (
              <SummarizeButton contactId={contactId} activities={activitiesForText} tenantId={tenantId} />
            ) : (
              <p style={{ fontSize: '14px', color: '#666' }}>Add activities to generate summary</p>
            )}
          </div>

          {/* Draft Message */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '12px' }}>📧 Draft Message</h3>
            <DraftMessageButton contactId={contactId} contactName={contact.name} tenantId={tenantId} />
          </div>

          {/* Generate Tasks */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '12px' }}>✓ Generate Tasks</h3>
            <GenerateTasksButton contactId={contactId} contactName={contact.name} tenantId={tenantId} />
          </div>
        </div>
      )}
    </div>
  )
}
