'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

type TokenStatus = 'loading' | 'valid' | 'invalid' | 'used' | 'expired'

interface FleetInfo {
  id: string
  name: string
  agencyId: string
  [key: string]: unknown
}

export default function FleetRegisterPage() {
  const params = useParams()
  const token = params.token as string

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('loading')
  const [fleetInfo, setFleetInfo] = useState<FleetInfo | null>(null)

  const [name, setName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await api.get(`/fleets/register/${token}`)
        setFleetInfo(res.data)
        setName(res.data.name ?? '')
        setTokenStatus('valid')
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } }).response?.status
        if (status === 409) {
          setTokenStatus('used')
        } else if (status === 410) {
          setTokenStatus('expired')
        } else {
          setTokenStatus('invalid')
        }
      }
    }

    validateToken()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/fleets/register/${token}`, {
        name,
        adminName,
        phone,
        ...(address ? { address } : {}),
        ...(contactPerson ? { contactPerson } : {}),
        password,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 w-full max-w-md">

        {tokenStatus === 'loading' && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {tokenStatus === 'invalid' && (
          <div className="text-center">
            <div className="text-3xl mb-4">🔗</div>
            <h2 className="text-white text-lg font-semibold mb-2">Invalid link</h2>
            <p className="text-zinc-500 text-sm">This registration link is not valid.</p>
          </div>
        )}

        {tokenStatus === 'used' && (
          <div className="text-center">
            <div className="text-3xl mb-4">✅</div>
            <h2 className="text-white text-lg font-semibold mb-2">Already registered</h2>
            <p className="text-zinc-500 text-sm mb-4">This invitation has already been used to create an account.</p>
            <Link
              href="/login"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}

        {tokenStatus === 'expired' && (
          <div className="text-center">
            <div className="text-3xl mb-4">⏰</div>
            <h2 className="text-white text-lg font-semibold mb-2">Link expired</h2>
            <p className="text-zinc-500 text-sm">This invitation link has expired. Ask your agency admin to send a new invite.</p>
          </div>
        )}

        {tokenStatus === 'valid' && submitted && (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <h2 className="text-white text-lg font-semibold mb-2">Registration submitted!</h2>
            <p className="text-zinc-500 text-sm mb-6">Your fleet account has been created and is pending approval from the agency. You'll be notified once approved.</p>
            <Link
              href="/login"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}

        {tokenStatus === 'valid' && !submitted && (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">D</div>
                <span className="text-white font-semibold text-sm">Dispatch 365</span>
              </div>
              <h1 className="text-white text-xl font-semibold">Complete your registration</h1>
              <p className="text-zinc-500 text-sm mt-1">Set up your fleet account to get started</p>
            </div>

            {fleetInfo && (
              <p className="text-zinc-400 text-sm mb-6">
                Registering fleet: <span className="text-white font-medium">{fleetInfo.name}</span>
              </p>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-zinc-400 text-sm mb-1.5">
                  Fleet Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your fleet name"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="mb-4">
                <label className="block text-zinc-400 text-sm mb-1.5">
                  Your Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="mb-4">
                <label className="block text-zinc-400 text-sm mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="mb-4">
                <label className="block text-zinc-400 text-sm mb-1.5">
                  Address <span className="text-zinc-600 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="mb-4">
                <label className="block text-zinc-400 text-sm mb-1.5">
                  Contact Person <span className="text-zinc-600 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Dispatcher or operations contact"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="mb-4">
                <label className="block text-zinc-400 text-sm mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="mb-4">
                <label className="block text-zinc-400 text-sm mb-1.5">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || password !== confirmPassword}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors mt-2"
              >
                {submitting ? 'Creating account...' : 'Complete Registration'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
