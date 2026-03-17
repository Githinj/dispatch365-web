'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import api from '@/lib/api'

export default function AgencySettingsPage() {
  const { user } = useAuthStore()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const rows = [
    { label: 'Agency ID', value: (user as { agencyId?: string } | null)?.agencyId ?? '—' },
    { label: 'Name',      value: user?.name  ?? '—' },
    { label: 'Email',     value: user?.email ?? '—' },
    { label: 'Role',      value: user?.role  ?? '—' },
  ]

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
      setStatus({ type: 'success', message: 'Password changed successfully.' })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to change password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Your agency account information</p>
      </div>

      {/* Account Info */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 max-w-lg">
        <h2 className="text-white font-medium text-sm mb-3">Account Info</h2>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-zinc-500 text-sm">{row.label}</span>
              <span className="text-zinc-200 text-sm font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 max-w-lg">
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
  )
}
