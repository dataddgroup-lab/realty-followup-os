'use client'

import { useEffect, useState } from 'react'
import { ContactsList } from './components/ContactsList'
import { ContactDetailWithAI } from './components/ContactDetailWithAI'
import { QuotaBadge } from './components/QuotaBadge'

export default function Home() {
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [tenantId] = useState('demo-tenant-1')

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId)
    setView('detail')
  }

  const handleBack = () => {
    setView('list')
    setSelectedContactId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header with Quota */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Contacts</h1>
          <p className="text-gray-600 mt-1">
            {view === 'list'
              ? 'Manage contacts and get AI summaries'
              : 'View contact details and timeline'}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <QuotaBadge tenantId={tenantId} />
        </div>
      </div>

      {/* Content */}
      {view === 'list' && (
        <ContactsListWithSelection
          tenantId={tenantId}
          onSelectContact={handleSelectContact}
        />
      )}

      {view === 'detail' && selectedContactId && (
        <ContactDetailWithAI
          contactId={selectedContactId}
          tenantId={tenantId}
          onBack={handleBack}
        />
      )}
    </div>
  )
}

function ContactsListWithSelection({
  tenantId,
  onSelectContact,
}: {
  tenantId: string
  onSelectContact: (contactId: string) => void
}) {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    fetchContacts()
  }, [tenantId])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/contacts', {
        headers: {
          'x-tenant-id': tenantId,
        },
      })

      if (!res.ok) throw new Error('Failed to fetch contacts')
      const data = await res.json()
      setContacts(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create contact')
      const newContact = await res.json()
      setContacts([newContact, ...contacts])
      setFormData({ name: '', email: '', phone: '' })
      setShowForm(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 card-shadow">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-gray-50 to-transparent">
        <h2 className="text-xl font-semibold text-gray-900">
          Contacts ({contacts.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary w-full sm:w-auto"
        >
          {showForm ? '✕ Cancel' : '+ New Contact'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-6 bg-red-50 border-b border-red-200">
          <div className="flex gap-3">
            <span className="text-red-600">⚠️</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50 scale-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                placeholder="John Smith"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Create Contact
            </button>
          </form>
        </div>
      )}

      {/* List */}
      {contacts.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-gray-600 font-medium">No contacts yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Create your first contact to get started
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition cursor-pointer group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    {contact.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 text-sm text-gray-600">
                    {contact.email && <span>{contact.email}</span>}
                    {contact.phone && (
                      <>
                        {contact.email && <span>•</span>}
                        <span>{contact.phone}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(contact.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      contact.status === 'active'
                        ? 'badge-success'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {contact.status}
                  </span>
                  <span className="text-gray-400 group-hover:text-blue-600 transition">
                    →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
