'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useDrivers } from '@/lib/hooks/useDrivers'
import { fmtDate } from '@/lib/utils'
import type { Driver } from '@/types'

export default function SuperAdminDriversPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useDrivers({ page, perPage: 20 })

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row: Driver) => <span className="text-white font-medium">{row.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row: Driver) => <span className="text-zinc-400">{row.email}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Driver) => <StatusBadge status={row.status} />,
    },
    {
      key: 'fleetId',
      header: 'Fleet ID',
      render: (row: Driver) => (
        <span className="text-zinc-500 font-mono text-xs">{row.fleetId}</span>
      ),
    },
    {
      key: 'licenseNumber',
      header: 'License #',
      render: (row: Driver) => (
        <span className="text-zinc-400">{row.licenseNumber ?? '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row: Driver) => <span className="text-zinc-500">{fmtDate(row.createdAt)}</span>,
    },
  ]

  if (isLoading) return <LoadingState />

  return (
    <div className="p-6">
      <PageHeader title="Drivers" description="All drivers across all fleets." />

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        {!data?.data.length ? (
          <EmptyState title="No drivers found." />
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
