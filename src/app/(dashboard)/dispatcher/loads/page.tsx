'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLoads } from '@/lib/hooks/useLoads'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmt, fmtDate } from '@/lib/utils'
import type { Load, LoadStatus } from '@/types'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Pending Confirmation', value: 'PENDING_DELIVERY_CONFIRMATION' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function DispatcherLoadsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading } = useLoads({
    page,
    perPage: 20,
    ...(status ? { status } : {}),
  })

  function handleStatusChange(value: string) {
    setStatus(value)
    setPage(1)
  }

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
      key: 'pickupLocation',
      header: 'Pickup',
      render: (row: Load) => (
        <span className="text-zinc-300 max-w-[160px] truncate block">{row.pickupLocation}</span>
      ),
    },
    {
      key: 'dropoffLocation',
      header: 'Dropoff',
      render: (row: Load) => (
        <span className="text-zinc-300 max-w-[160px] truncate block">{row.dropoffLocation}</span>
      ),
    },
    {
      key: 'pickupDate',
      header: 'Pickup Date',
      render: (row: Load) => (
        <span className="text-zinc-400">{fmtDate(row.pickupDate)}</span>
      ),
    },
    {
      key: 'loadRate',
      header: 'Rate',
      render: (row: Load) => (
        <span className="text-zinc-300 font-medium">{fmt(row.loadRate)}</span>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="My Loads"
        description="Manage and track all your dispatched loads"
        action={
          <Link
            href="/dispatcher/loads/new"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New Load
          </Link>
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === tab.value
                ? 'bg-orange-500 text-white'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.07] border border-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl">
        {isLoading ? (
          <div className="p-6">
            <LoadingState />
          </div>
        ) : !data?.data.length ? (
          <div className="p-6">
            <EmptyState title="No loads found for the selected filter." />
          </div>
        ) : (
          <>
            <DataTable<Load>
              columns={columns}
              data={data.data}
              keyExtractor={(r) => r.id}
              onRowClick={(r) => router.push(`/dispatcher/loads/${r.id}`)}
            />
            {data.meta.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-white/[0.06]">
                <Pagination meta={data.meta} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
