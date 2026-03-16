'use client'

import { useState } from 'react'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with Quota */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111' }}>Your Contacts</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            {view === 'list'
              ? 'Manage your real estate leads and follow-ups'
              : 'View contact details and activities'}
          </p>
        </div>
        <QuotaBadge tenantId={tenantId} />
      </div>

      {/* Main Content */}
      {view === 'list' ? (
        <ContactsList tenantId={tenantId} onSelectContact={handleSelectContact} />
      ) : (
        <ContactDetailWithAI
          contactId={selectedContactId!}
          tenantId={tenantId}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
