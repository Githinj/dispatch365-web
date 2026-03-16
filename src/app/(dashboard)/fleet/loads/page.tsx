'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useLoads } from '@/lib/hooks/useLoads'
import { fmt, fmtDate } from '@/lib/utils'
import type { Load } from '@/types'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function FleetLoadsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useLoads({
    page,
    perPage: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
  })

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
      key: 'driver',
      header: 'Driver',
      render: (row: Load) => (
        <span className="text-zinc-300">{row.driver?.name ?? '—'}</span>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (row: Load) => (
        <span className="text-zinc-400 text-xs">
          {row.vehicle ? `${row.vehicle.make} ${row.vehicle.model}` : '—'}
        </span>
      ),
    },
    {
      key: 'route',
      header: 'Pickup → Dropoff',
      render: (row: Load) => (
        <span className="text-zinc-400 text-xs">
          {row.pickupLocation} → {row.dropoffLocation}
        </span>
      ),
    },
    {
      key: 'pickupDate',
      header: 'Date',
      render: (row: Load) => (
        <span className="text-zinc-400 text-xs">{fmtDate(row.pickupDate)}</span>
      ),
    },
    {
      key: 'fleetEarnings',
      header: 'Fleet Earnings',
      render: (row: Load) => (
        <span className="text-green-400 font-medium">{fmt(row.fleetEarnings)}</span>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader title="Loads" description="All loads assigned to your fleet." />

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1) }}
            className={
              statusFilter === f.value
                ? 'px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20'
                : 'px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 border border-transparent'
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl">
        {isLoading ? (
          <div className="p-6"><LoadingState /></div>
        ) : !data?.data?.length ? (
          <div className="p-6"><EmptyState title="No loads found." /></div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data.data}
              keyExtractor={(r) => r.id}
              onRowClick={(r) => router.push(`/fleet/loads/${r.id}`)}
            />
            <div className="px-4 py-3 border-t border-white/[0.06]">
              <Pagination meta={data.meta} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
