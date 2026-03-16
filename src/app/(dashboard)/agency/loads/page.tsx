'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoads } from '@/lib/hooks/useLoads'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmt, fmtDate } from '@/lib/utils'
import { Load } from '@/types'

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Pending Confirmation', value: 'PENDING_DELIVERY_CONFIRMATION' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function AgencyLoadsPage() {
  const router = useRouter()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useLoads({
    page,
    perPage: 20,
    status: status || undefined,
  })

  const columns = [
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
      key: 'fleet',
      header: 'Fleet',
      render: (r: Load) => (
        <span className="text-zinc-400 text-sm">{r.fleet?.name ?? '—'}</span>
      ),
    },
    {
      key: 'route',
      header: 'Pickup → Dropoff',
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
    {
      key: 'loadRate',
      header: 'Rate',
      render: (r: Load) => (
        <span className="text-white text-sm font-medium">{fmt(r.loadRate)}</span>
      ),
      className: 'text-right',
    },
  ]

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Loads" description="All loads managed by your agency" />

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value)
              setPage(1)
            }}
            className={
              status === tab.value
                ? 'px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20'
                : 'px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 border border-transparent'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : !data?.data?.length ? (
        <EmptyState title="No loads found" />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data.data}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => router.push(`/agency/loads/${r.id}`)}
          />
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
