'use client'

import { useEffect, useState } from 'react'

interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  status: string
  created_at: string
}

interface ContactsListProps {
  tenantId: string
  onSelectContact: (contactId: string) => void
}

export function ContactsList({ tenantId, onSelectContact }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    fetchContacts()
  }, [tenantId])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/contacts', {
        headers: { 'x-tenant-id': tenantId },
      })
      if (!res.ok) throw new Error('Failed to fetch contacts')
      const data = await res.json()
      setContacts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'x-tenant-id': tenantId, 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      })
      if (!res.ok) throw new Error('Failed to add contact')
      setNewContact({ name: '', email: '', phone: '' })
      await fetchContacts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding contact')
    }
  }

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>Loading contacts...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Add Contact Form */}
      <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111' }}>Add Contact</h3>
        <input
          type="text"
          placeholder="Name"
          value={newContact.name}
          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          required
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={newContact.email}
          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={newContact.phone}
          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
        />
        <button
          type="submit"
          style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Add Contact
        </button>
      </form>

      {/* Contacts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111' }}>Contacts ({contacts.length})</h2>
        {error && <div style={{ padding: '12px', backgroundColor: '#fee', borderRadius: '6px', color: '#c33', fontSize: '14px' }}>{error}</div>}
        {contacts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#999', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>No contacts yet</div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              style={{
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#fff',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f4ff'
                e.currentTarget.style.borderColor = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
                e.currentTarget.style.borderColor = '#ddd'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111' }}>{contact.name}</h3>
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{contact.email || 'No email'}</p>
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>{contact.phone || 'No phone'}</p>
                </div>
                <span style={{ padding: '4px 8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                  {contact.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
