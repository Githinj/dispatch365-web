'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useDispatchers } from '@/lib/hooks/useDispatchers'
import type { Dispatcher } from '@/types'

export default function SuperAdminDispatchersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useDispatchers({ page, perPage: 20 })

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row: Dispatcher) => <span className="text-white font-medium">{row.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row: Dispatcher) => <span className="text-zinc-400">{row.email}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Dispatcher) => <StatusBadge status={row.status} />,
    },
    {
      key: 'agencyId',
      header: 'Agency ID',
      render: (row: Dispatcher) => (
        <span className="text-zinc-500 font-mono text-xs">{row.agencyId}</span>
      ),
    },
    {
      key: 'totalLoadsCreated',
      header: 'Total Loads',
      render: (row: Dispatcher) => <span className="text-zinc-300">{row.totalLoadsCreated}</span>,
    },
    {
      key: 'completionRate',
      header: 'Completion Rate',
      render: (row: Dispatcher) => (
        <span className="text-zinc-300">{(row.completionRate * 100).toFixed(1)}%</span>
      ),
    },
    {
      key: 'overallRating',
      header: 'Rating',
      render: (row: Dispatcher) => (
        <span className="text-zinc-300">
          {row.overallRating > 0 ? row.overallRating.toFixed(1) : '—'}
        </span>
      ),
    },
  ]

  if (isLoading) return <LoadingState />

  return (
    <div className="p-6">
      <PageHeader title="Dispatchers" description="All dispatchers across all agencies." />

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        {!data?.data.length ? (
          <EmptyState title="No dispatchers found." />
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
