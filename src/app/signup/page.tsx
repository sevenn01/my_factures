'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { supabase } from '@/lib/supabaseClient'
import { useCompany } from '@/lib/companyContext'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()
  const { refreshCompanies } = useCompany()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data } = await signUp(email, password)
      const userId = data?.user?.id

      if (userId) {
        await refreshCompanies();
        const {
          data: companyUser,
        } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', userId)
          .maybeSingle()

        if (companyUser?.company_id) {
          router.push('/dashboard')
        } else {
          router.push('/company-setup')
        }
        return
      }

      router.push('/login?message=Check your email to confirm your account')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="notion-box slide-in w-full max-w-sm mx-auto">
        <h1 className="notion-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Sign Up</h1>

        {error && (
          <div className="notion-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label className="notion-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="notion-input"
            />
          </div>

          <div>
            <label className="notion-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="notion-input"
            />
          </div>

          <div>
            <label className="notion-label">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="notion-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="notion-btn w-full mt-4"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--foreground)] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
