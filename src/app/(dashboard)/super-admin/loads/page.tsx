'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useLoads } from '@/lib/hooks/useLoads'
import { fmt, fmtDate } from '@/lib/utils'
import type { Load, LoadStatus } from '@/types'

const STATUSES: Array<{ label: string; value: LoadStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Pending Confirmation', value: 'PENDING_DELIVERY_CONFIRMATION' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function SuperAdminLoadsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<LoadStatus | ''>('')

  const { data, isLoading } = useLoads({
    page,
    perPage: 20,
    status: status || undefined,
  })

  const columns = [
    {
      key: 'loadNumber',
      header: 'Load #',
      render: (row: Load) => (
        <span className="text-white font-mono font-medium">{row.loadNumber}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Load) => <StatusBadge status={row.status} />,
    },
    {
      key: 'agencyId',
      header: 'Agency',
      render: (row: Load) => (
        <span className="text-zinc-500 font-mono text-xs">{row.agencyId}</span>
      ),
    },
    {
      key: 'dispatcher',
      header: 'Dispatcher',
      render: (row: Load) => (
        <span className="text-zinc-400">{row.dispatcher?.name ?? '—'}</span>
      ),
    },
    {
      key: 'fleet',
      header: 'Fleet',
      render: (row: Load) => (
        <span className="text-zinc-400">{row.fleet?.name ?? '—'}</span>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (row: Load) => (
        <span className="text-zinc-400 text-xs">
          {row.pickupLocation} → {row.dropoffLocation}
        </span>
      ),
    },
    {
      key: 'pickupDate',
      header: 'Pickup Date',
      render: (row: Load) => (
        <span className="text-zinc-500">{fmtDate(row.pickupDate)}</span>
      ),
    },
    {
      key: 'loadRate',
      header: 'Rate',
      render: (row: Load) => (
        <span className="text-zinc-300">{fmt(row.loadRate)}</span>
      ),
    },
  ]

  if (isLoading) return <LoadingState />

  return (
    <div className="p-6">
      <PageHeader title="Loads" description="All loads across the platform." />

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatus(s.value); setPage(1) }}
            className={
              status === s.value
                ? 'px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20'
                : 'px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 border border-transparent'
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        {!data?.data.length ? (
          <EmptyState title="No loads found." />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data.data}
              keyExtractor={(r) => r.id}
            />
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
