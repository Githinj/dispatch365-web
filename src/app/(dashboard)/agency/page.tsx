'use client'

import { useLoads } from '@/lib/hooks/useLoads'
import { useInvoices } from '@/lib/hooks/useInvoices'
import { useDispatchers } from '@/lib/hooks/useDispatchers'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { fmtDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Load } from '@/types'

export default function AgencyDashboardPage() {
  const router = useRouter()

  const { data: allLoads, isLoading: loadsLoading } = useLoads({ page: 1, perPage: 1 })
  const { data: completedLoads, isLoading: completedLoading } = useLoads({
    page: 1,
    perPage: 1,
    status: 'COMPLETED',
  })
  const { data: unpaidInvoices, isLoading: unpaidLoading } = useInvoices({
    page: 1,
    perPage: 1,
    status: 'UNPAID',
  })
  const { data: overdueInvoices, isLoading: overdueLoading } = useInvoices({
    page: 1,
    perPage: 1,
    status: 'OVERDUE',
  })
  const { data: dispatchers, isLoading: dispatchersLoading } = useDispatchers({
    page: 1,
    perPage: 1,
  })
  const { data: recentLoadsData, isLoading: recentLoading } = useLoads({
    page: 1,
    perPage: 5,
  })

  const statsLoading =
    loadsLoading || completedLoading || unpaidLoading || overdueLoading || dispatchersLoading

  const pendingInvoices =
    (unpaidInvoices?.meta?.total ?? 0) + (overdueInvoices?.meta?.total ?? 0)

  const recentColumns = [
    {
      key: 'loadNumber',
      header: 'Load #',
      render: (r: Load) => (
        <span className="text-orange-400 font-mono text-sm">{r.loadNumber}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Load) => <StatusBadge status={r.status} />,
    },
    {
      key: 'dispatcher',
      header: 'Dispatcher',
      render: (r: Load) => (
        <span className="text-zinc-300 text-sm">{r.dispatcher?.name ?? '—'}</span>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (r: Load) => (
        <span className="text-zinc-400 text-sm">
          {r.pickupLocation}
          <span className="text-zinc-600 mx-1">→</span>
          {r.dropoffLocation}
        </span>
      ),
    },
    {
      key: 'pickupDate',
      header: 'Date',
      render: (r: Load) => (
        <span className="text-zinc-400 text-sm">{fmtDate(r.pickupDate)}</span>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Agency Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Overview of your agency&apos;s operations</p>
      </div>

      {statsLoading ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Loads" value={allLoads?.meta?.total ?? 0} sub="All time" />
          <StatCard
            label="Completed Loads"
            value={completedLoads?.meta?.total ?? 0}
            sub="Delivered"
            accent
          />
          <StatCard
            label="Pending Invoices"
            value={pendingInvoices}
            sub="Unpaid + Overdue"
          />
          <StatCard
            label="Total Dispatchers"
            value={dispatchers?.meta?.total ?? 0}
            sub="Active staff"
          />
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-medium text-sm">Recent Loads</h2>
          <Link
            href="/agency/loads"
            className="text-orange-400 hover:text-orange-300 text-xs font-medium"
          >
            View all →
          </Link>
        </div>
        {recentLoading ? (
          <LoadingState />
        ) : (
          <DataTable
            columns={recentColumns}
            data={recentLoadsData?.data ?? []}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => router.push(`/agency/loads/${r.id}`)}
          />
        )}
      </div>
    </div>
  )
}
