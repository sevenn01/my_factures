'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { supabase } from '@/lib/supabaseClient'
import { useCompany } from '@/lib/companyContext'

export default function CompanySetupPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { refreshCompanies } = useCompany()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [ice, setIce] = useState('')
  const [phone, setPhone] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !ice || !phone) {
      setError('Please fill in all required fields.')
      return
    }

    if (!user) {
      setError('User not authenticated.')
      return
    }

    setSaving(true)

    try {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name,
          email,
          ice,
          phone,
          logo_url: logoUrl || null,
          owner_id: user.id,
        })
        .select('id,name')
        .single()

      if (companyError || !companyData) {
        throw companyError ?? new Error('Failed to create company')
      }

      const { error: companyUserError } = await supabase.from('company_users').insert({
        company_id: companyData.id,
        user_id: user.id,
        role: 'owner',
      })

      if (companyUserError) {
        throw companyUserError
      }

      await refreshCompanies()

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="notion-box slide-in w-full max-w-md">
        <h1 className="notion-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Company Setup</h1>
        <p className="text-[var(--muted)] text-sm mb-6">Let's create your first workspace.</p>
        {error && <div className="notion-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label className="notion-label">Company Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="notion-input"
              placeholder="e.g. Acme Inc."
            />
          </div>
          <div>
            <label className="notion-label">Company Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="notion-input"
              placeholder="e.g. hello@acme.com"
            />
          </div>
          <div>
            <label className="notion-label">ICE</label>
            <input
              value={ice}
              onChange={(e) => setIce(e.target.value)}
              required
              className="notion-input"
              placeholder="e.g. 123456789"
            />
          </div>
          <div>
            <label className="notion-label">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="notion-input"
              placeholder="e.g. +212 600-000000"
            />
          </div>
          <div>
            <label className="notion-label">Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="notion-input"
              placeholder="e.g. https://logo.com/mylogo.png"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="notion-btn"
          >
            {saving ? 'Saving...' : 'Create Company'}
          </button>
        </form>
      </div>
    </div>
  )
}
