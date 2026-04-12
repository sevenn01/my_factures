'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { supabase } from '@/lib/supabaseClient'
import { useCompany } from '@/lib/companyContext'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()
  const { refreshCompanies } = useCompany()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw sessionError
      const userId = session?.user?.id
      if (!userId) throw new Error('Signed in user not found')

      await refreshCompanies();

      const {
        data: companyUser,
        error: companyError,
      } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (companyUser && companyUser.company_id) {
        router.push('/dashboard')
      } else {
        router.push('/company-setup')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="notion-box slide-in w-full max-w-sm mx-auto">
        <h1 className="notion-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Login</h1>

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
              placeholder="e.g. Acme Inc."
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

          <button
            type="submit"
            disabled={loading}
            className="notion-btn w-full mt-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[var(--foreground)] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
