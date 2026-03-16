'use client'

import { useLoads } from '@/lib/hooks/useLoads'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable } from '@/components/shared/DataTable'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmt, fmtDate } from '@/lib/utils'
import type { Load } from '@/types'

export default function DispatcherPerformancePage() {
  const router = useRouter()

  const { data: allLoads, isLoading: loadingAll } = useLoads({ perPage: 1 })
  const { data: completedLoads, isLoading: loadingCompleted } = useLoads({ status: 'COMPLETED', perPage: 1 })
  const { data: cancelledLoads, isLoading: loadingCancelled } = useLoads({ status: 'CANCELLED', perPage: 1 })
  const { data: recentCompleted, isLoading: loadingRecent } = useLoads({ status: 'COMPLETED', perPage: 10 })

  const isLoading = loadingAll || loadingCompleted || loadingCancelled || loadingRecent

  const total = allLoads?.meta.total ?? 0
  const completed = completedLoads?.meta.total ?? 0
  const cancelled = cancelledLoads?.meta.total ?? 0
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const columns = [
    {
      key: 'loadNumber',
      header: 'Load #',
      render: (row: Load) => (
        <span className="text-orange-400 font-medium">{row.loadNumber}</span>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (row: Load) => (
        <span className="text-zinc-300">
          {row.pickupLocation} → {row.dropoffLocation}
        </span>
      ),
    },
    {
      key: 'completedAt',
      header: 'Completed',
      render: (row: Load) => (
        <span className="text-zinc-400">
          {row.completedAt ? fmtDate(row.completedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'loadRate',
      header: 'Rate',
      render: (row: Load) => (
        <span className="text-zinc-300">{fmt(row.loadRate)}</span>
      ),
    },
    {
      key: 'dispatcherEarnings',
      header: 'Your Earnings',
      render: (row: Load) => (
        <span className="text-orange-400 font-medium">{fmt(row.dispatcherEarnings)}</span>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Performance"
        description="Track your dispatch performance and earnings"
      />

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Loads" value={total} />
            <StatCard label="Completed" value={completed} />
            <StatCard label="Cancelled" value={cancelled} />
            <StatCard
              label="Completion Rate"
              value={`${completionRate}%`}
              accent={true}
              sub={`${completed} of ${total} loads`}
            />
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="text-white font-medium text-sm">Recently Completed Loads</p>
            </div>

            {!recentCompleted?.data.length ? (
              <div className="p-6">
                <EmptyState title="No completed loads yet." />
              </div>
            ) : (
              <DataTable<Load>
                columns={columns}
                data={recentCompleted.data}
                keyExtractor={(r) => r.id}
                onRowClick={(r) => router.push(`/dispatcher/loads/${r.id}`)}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
