'use client'

import { useAuthStore } from '@/store/auth.store'

export default function AgencySettingsPage() {
  const { user } = useAuthStore()

  const rows = [
    { label: 'Agency ID', value: (user as { agencyId?: string } | null)?.agencyId ?? '—' },
    { label: 'Name', value: user?.name ?? '—' },
    { label: 'Email', value: user?.email ?? '—' },
    { label: 'Role', value: user?.role ?? '—' },
  ]

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Your agency account information</p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 max-w-lg">
        <h2 className="text-white font-medium text-sm mb-3">Agency Info</h2>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-zinc-500 text-sm">{row.label}</span>
              <span className="text-zinc-200 text-sm font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
