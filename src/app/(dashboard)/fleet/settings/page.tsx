'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { useAuthStore } from '@/store/auth.store'

export default function FleetSettingsPage() {
  const { user } = useAuthStore()

  return (
    <div className="p-6">
      <PageHeader
        title="Settings"
        description="Your fleet account information."
      />

      <div className="max-w-xl">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white font-medium text-sm mb-3">Fleet Profile</p>
          <dl className="space-y-4">
            <div>
              <dt className="text-zinc-500 text-xs mb-0.5 uppercase tracking-wide">Fleet ID</dt>
              <dd className="text-zinc-300 text-sm font-mono bg-white/[0.03] border border-white/[0.06] rounded px-3 py-2 mt-1">
                {user?.fleetId ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs mb-0.5 uppercase tracking-wide">Name</dt>
              <dd className="text-zinc-300 text-sm bg-white/[0.03] border border-white/[0.06] rounded px-3 py-2 mt-1">
                {user?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs mb-0.5 uppercase tracking-wide">Email</dt>
              <dd className="text-zinc-300 text-sm bg-white/[0.03] border border-white/[0.06] rounded px-3 py-2 mt-1">
                {user?.email ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs mb-0.5 uppercase tracking-wide">Role</dt>
              <dd className="text-zinc-300 text-sm bg-white/[0.03] border border-white/[0.06] rounded px-3 py-2 mt-1">
                {user?.role ?? '—'}
              </dd>
            </div>
          </dl>
          <p className="text-zinc-600 text-xs mt-4">
            To update your fleet profile, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
