'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useInvoices } from '@/lib/hooks/useInvoices'
import { fmt, fmtDate } from '@/lib/utils'
import type { Invoice } from '@/types'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Unpaid', value: 'UNPAID' },
  { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Disputed', value: 'DISPUTED' },
]

export default function FleetInvoicesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useInvoices({
    page,
    perPage: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
  })

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (row: Invoice) => (
        <span className="text-orange-400 font-medium">{row.invoiceNumber}</span>
      ),
    },
    {
      key: 'loadId',
      header: 'Load #',
      render: (row: Invoice) => (
        <span className="text-zinc-300 text-sm">{row.load?.loadNumber ?? '—'}</span>
      ),
    },
    {
      key: 'agency',
      header: 'Agency',
      render: (row: Invoice) => (
        <span className="text-zinc-400 text-sm">{row.fleet?.name ?? '—'}</span>
      ),
    },
    {
      key: 'fleetEarnings',
      header: 'Amount',
      render: (row: Invoice) => (
        <span className="text-zinc-200 font-medium">{fmt(row.fleetEarnings)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Invoice) => <StatusBadge status={row.status} />,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row: Invoice) => (
        <span className="text-zinc-400 text-xs">{row.dueDate ? fmtDate(row.dueDate) : '—'}</span>
      ),
    },
    {
      key: 'amountPaid',
      header: 'Paid',
      render: (row: Invoice) => (
        <span className="text-green-400 text-sm">{row.amountPaid != null ? fmt(row.amountPaid) : '—'}</span>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader title="Invoices" description="View and manage invoices for your fleet." />

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
          <div className="p-6"><EmptyState title="No invoices found." /></div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data.data}
              keyExtractor={(r) => r.id}
              onRowClick={(r) => router.push(`/fleet/invoices/${r.id}`)}
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
