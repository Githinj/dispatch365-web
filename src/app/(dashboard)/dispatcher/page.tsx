'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLoads } from '@/lib/hooks/useLoads'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable } from '@/components/shared/DataTable'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmtDate } from '@/lib/utils'
import type { Load } from '@/types'

export default function DispatcherDashboardPage() {
  const router = useRouter()

  const { data: allLoads, isLoading: loadingAll } = useLoads({ perPage: 1 })
  const { data: completedLoads, isLoading: loadingCompleted } = useLoads({ status: 'COMPLETED', perPage: 1 })
  const { data: inTransitLoads, isLoading: loadingInTransit } = useLoads({ status: 'IN_TRANSIT', perPage: 1 })
  const { data: recentLoads, isLoading: loadingRecent } = useLoads({ perPage: 5 })

  const isLoading = loadingAll || loadingCompleted || loadingInTransit || loadingRecent

  const total = allLoads?.meta.total ?? 0
  const completed = completedLoads?.meta.total ?? 0
  const inTransit = inTransitLoads?.meta.total ?? 0
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
      key: 'status',
      header: 'Status',
      render: (row: Load) => <StatusBadge status={row.status} />,
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
      key: 'pickupDate',
      header: 'Pickup Date',
      render: (row: Load) => (
        <span className="text-zinc-400">{fmtDate(row.pickupDate)}</span>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your dispatch activity"
        action={
          <Link
            href="/dispatcher/loads/new"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New Load
          </Link>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Loads" value={total} />
            <StatCard label="Completed" value={completed} />
            <StatCard label="In Transit" value={inTransit} />
            <StatCard
              label="Completion Rate"
              value={`${completionRate}%`}
              accent={true}
              sub={`${completed} of ${total} loads`}
            />
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-white font-medium text-sm">Recent Loads</p>
              <Link
                href="/dispatcher/loads"
                className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
              >
                View all →
              </Link>
            </div>

            {!recentLoads?.data.length ? (
              <div className="p-6">
                <EmptyState title="No loads yet. Create your first load to get started." />
              </div>
            ) : (
              <DataTable<Load>
                columns={columns}
                data={recentLoads.data}
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
