'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/auth.store'
import api from '@/lib/api'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})
type FormData = z.infer<typeof schema>

const ROLE_REDIRECTS: Record<string, string> = {
  SUPER_ADMIN: '/super-admin',
  AGENCY_ADMIN: '/agency',
  DISPATCHER: '/dispatcher',
  FLEET_ADMIN: '/fleet',
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { setAuth, user } = useAuthStore()
  const [serverError, setServerError] = useState('')
  const reason = params.get('reason')
  const suspended = params.get('suspended')

  useEffect(() => {
    if (user) router.replace(ROLE_REDIRECTS[user.role] || '/')
  }, [user, router])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const res = await api.post('/auth/login', data)
      setAuth(res.data.data.user, res.data.data.token)
      router.push(ROLE_REDIRECTS[res.data.data.user.role] || '/')
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="relative w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Dispatch 365</span>
          </div>
          <p className="text-zinc-500 text-sm">Trucking dispatch management platform</p>
        </div>
        {reason === 'SESSION_INVALIDATED' && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
            You were logged out because your account was accessed from another device.
          </div>
        )}
        {suspended && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            Your account has been suspended. Contact your administrator.
          </div>
        )}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
          <h1 className="text-white text-xl font-semibold mb-6">Sign in to your account</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Email address</label>
              <input {...register('email')} type="email" placeholder="you@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
              <input {...register('password')} type="password" placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors" />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>
            {serverError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{serverError}</div>
            )}
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <LoginForm />
    </Suspense>
  )
}
