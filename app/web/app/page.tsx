'use client'

import { useState } from 'react'
import { ContactsList } from './components/ContactsList'
import { ContactDetailWithAI } from './components/ContactDetailWithAI'
import { QuotaBadge } from './components/QuotaBadge'

export default function Home() {
  const [view, setView] = useState<'auth' | 'list' | 'detail'>('auth')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignup, setIsSignup] = useState(true)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)

    try {
      if (isSignup) {
        // Sign up
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Signup failed')
        }

        const data = await res.json()
        setTenantId(data.tenant_id)
        setView('list')
      } else {
        // Login - for now, just use signup flow as login
        // In production, you'd have a separate /api/auth/login endpoint
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: email }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Login failed')
        }

        const data = await res.json()
        setTenantId(data.tenant_id)
        setView('list')
      }

      setEmail('')
      setPassword('')
      setName('')
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    setView('auth')
    setTenantId(null)
    setEmail('')
    setPassword('')
    setName('')
    setSelectedContactId(null)
  }

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId)
    setView('detail')
  }

  const handleBack = () => {
    setView('list')
    setSelectedContactId(null)
  }

  if (view === 'auth') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', marginBottom: '8px', textAlign: 'center' }}>
            Realty Follow-Up OS
          </h1>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', textAlign: 'center' }}>
            {isSignup ? 'Create an account' : 'Sign in to your account'}
          </p>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isSignup && (
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignup}
                style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
            />

            {authError && (
              <div style={{ padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#991b1b', fontSize: '14px', borderLeft: '4px solid #dc2626' }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{
                padding: '12px',
                backgroundColor: authLoading ? '#d1d5db' : '#2563eb',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {authLoading ? 'Loading...' : isSignup ? 'Sign Up' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup)
                setAuthError(null)
              }}
              style={{
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#2563eb',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: '#999', marginTop: '24px', textAlign: 'center' }}>
            Demo account: use any email/password to create a new account
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111' }}>Your Contacts</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            {view === 'list'
              ? 'Manage your real estate leads and follow-ups'
              : 'View contact details and activities'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {tenantId && <QuotaBadge tenantId={tenantId} />}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      {view === 'list' && tenantId ? (
        <ContactsList tenantId={tenantId} onSelectContact={handleSelectContact} />
      ) : view === 'detail' && tenantId && selectedContactId ? (
        <ContactDetailWithAI contactId={selectedContactId} tenantId={tenantId} onBack={handleBack} />
      ) : null}
    </div>
  )
}
