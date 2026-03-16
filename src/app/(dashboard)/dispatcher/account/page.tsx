'use client'

import { useAuthStore } from '@/store/auth.store'
import { PageHeader } from '@/components/shared/PageHeader'

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
  const { user } = useAuthStore()

  return (
    <div className="p-6">
      <PageHeader
        title="My Account"
        description="Your profile and account details"
      />

      <div className="max-w-lg">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          {/* Avatar / Initials */}
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
          <InfoRow label="Full Name" value={user?.name ?? '—'} />
          <InfoRow label="Email Address" value={user?.email ?? '—'} />
          <InfoRow
            label="Role"
            value={user?.role ? (ROLE_LABELS[user.role] ?? user.role) : '—'}
          />
          {user?.agencyId && <InfoRow label="Agency ID" value={user.agencyId} />}
        </div>

        <p className="text-zinc-600 text-xs mt-4 text-center">
          To update your profile details, contact your agency administrator.
        </p>
      </div>
    </div>
  )
}
