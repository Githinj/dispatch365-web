'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { PageHeader } from '@/components/shared/PageHeader'
import api from '@/lib/api'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className="text-zinc-200 text-sm">{value}</span>
    </div>
  )
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  AGENCY_ADMIN: 'Agency Admin',
  DISPATCHER: 'Dispatcher',
  FLEET_ADMIN: 'Fleet Admin',
  DRIVER: 'Driver',
}

export default function DispatcherAccountPage() {
  const { user, setAuth, token } = useAuthStore()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const mustChange = (user as any)?.mustChangePassword === true

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      })
      // Refresh user in store so mustChangePassword updates
      const me = await api.get('/auth/me')
      setAuth(me.data.data, token!)
      setStatus({ type: 'success', message: 'Password changed successfully.' })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to change password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="My Account" description="Your profile and account details" />

      {/* Password change warning */}
      {mustChange && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <span className="text-amber-400 text-lg mt-0.5">⚠</span>
          <div>
            <p className="text-amber-300 font-medium text-sm">You must change your password</p>
            <p className="text-amber-400/80 text-xs mt-0.5">
              Your account was created with a temporary password. Please change it below before continuing.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-lg space-y-5">
        {/* Account Info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/[0.06]">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
              <span className="text-orange-400 font-semibold text-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{user?.name ?? '—'}</p>
              <p className="text-zinc-500 text-sm">{user?.email ?? '—'}</p>
            </div>
          </div>
          <p className="text-white font-medium text-sm mb-3">Account Info</p>
          <InfoRow label="Full Name"      value={user?.name ?? '—'} />
          <InfoRow label="Email Address"  value={user?.email ?? '—'} />
          <InfoRow label="Role"           value={user?.role ? (ROLE_LABELS[user.role] ?? user.role) : '—'} />
          {user?.agencyId && <InfoRow label="Agency ID" value={user.agencyId} />}
        </div>

        {/* Change Password */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-3">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs mb-1">Current Password</label>
              <input
                type="password"
                required
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
            {status && (
              <div className={`p-3 rounded-lg text-sm border ${
                status.type === 'success'
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {status.message}
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {loading ? 'Saving…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
