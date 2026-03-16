'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  usePlatformSettings,
  useUpdatePlatformSetting,
  useFlaggedRatings,
  useRemoveFlaggedRating,
} from '@/lib/hooks/useSuperAdmin'
import { fmtDate } from '@/lib/utils'

interface Setting {
  id: string
  key: string
  value: string
  description?: string
}

interface FlaggedRating {
  id: string
  dispatcherId: string
  rating: number
  comment?: string
  isFlat: boolean
  ratedByFleetAdminId?: string
  createdAt: string
  dispatcher?: { name: string }
  ratedByFleetAdmin?: { name: string }
}

function SettingRow({ setting }: { setting: Setting }) {
  const [value, setValue] = useState(setting.value)
  const update = useUpdatePlatformSetting()

  useEffect(() => {
    setValue(setting.value)
  }, [setting.value])

  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/[0.05] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">{setting.key}</p>
        {setting.description && (
          <p className="text-zinc-500 text-xs mt-0.5">{setting.description}</p>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-64 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
      />
      <button
        onClick={() => update.mutate({ key: setting.key, value })}
        disabled={update.isPending || value === setting.value}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Save
      </button>
    </div>
  )
}

export default function SuperAdminSettingsPage() {
  const { data: settings, isLoading: settingsLoading } = usePlatformSettings()
  const { data: flaggedRatings, isLoading: ratingsLoading } = useFlaggedRatings()
  const removeRating = useRemoveFlaggedRating()

  const ratingColumns = [
    {
      key: 'dispatcher',
      header: 'Dispatcher',
      render: (row: FlaggedRating) => (
        <span className="text-white font-medium">{row.dispatcher?.name ?? row.dispatcherId}</span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row: FlaggedRating) => (
        <span className="text-zinc-300">{row.rating.toFixed(1)}</span>
      ),
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (row: FlaggedRating) => (
        <span className="text-zinc-400 text-xs">{row.comment ?? '—'}</span>
      ),
    },
    {
      key: 'ratedBy',
      header: 'Rated By',
      render: (row: FlaggedRating) => (
        <span className="text-zinc-400">{row.ratedByFleetAdmin?.name ?? '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row: FlaggedRating) => (
        <span className="text-zinc-500">{fmtDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: FlaggedRating) => (
        <button
          onClick={() => removeRating.mutate({ id: row.id })}
          disabled={removeRating.isPending}
          className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
        >
          Remove
        </button>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader title="Platform Settings" description="Manage global platform configuration and flagged ratings." />

      {/* Settings */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-8">
        <p className="text-white font-medium text-sm mb-3">Configuration</p>
        {settingsLoading ? (
          <LoadingState />
        ) : !settings?.length ? (
          <EmptyState title="No settings found." />
        ) : (
          <div>
            {settings.map((setting) => (
              <SettingRow key={setting.id} setting={setting} />
            ))}
          </div>
        )}
      </div>

      {/* Flagged Ratings */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-white font-medium text-sm">Flagged Ratings</p>
          <p className="text-zinc-500 text-xs mt-0.5">Dispatcher ratings that have been flagged for review.</p>
        </div>
        {ratingsLoading ? (
          <div className="p-5"><LoadingState /></div>
        ) : !flaggedRatings?.length ? (
          <EmptyState title="No flagged ratings." />
        ) : (
          <DataTable
            columns={ratingColumns}
            data={flaggedRatings}
            keyExtractor={(r: FlaggedRating) => r.id}
          />
        )}
      </div>
    </div>
  )
}
