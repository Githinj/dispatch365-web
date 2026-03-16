'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInvoices } from '@/lib/hooks/useInvoices'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmt, fmtDate } from '@/lib/utils'
import { Invoice } from '@/types'

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Unpaid', value: 'UNPAID' },
  { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Disputed', value: 'DISPUTED' },
]

export default function AgencyInvoicesPage() {
  const router = useRouter()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useInvoices({
    page,
    perPage: 20,
    status: status || undefined,
  })

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (r: Invoice) => (
        <span className="text-orange-400 font-mono text-sm">{r.invoiceNumber}</span>
      ),
    },
    {
      key: 'fleet',
      header: 'Fleet',
      render: (r: Invoice) => (
        <span className="text-zinc-300 text-sm">{r.fleet?.name ?? '—'}</span>
      ),
    },
    {
      key: 'fleetEarnings',
      header: 'Amount',
      render: (r: Invoice) => (
        <span className="text-white text-sm font-medium">{fmt(r.fleetEarnings)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Invoice) => <StatusBadge status={r.status} />,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (r: Invoice) => (
        <span className="text-zinc-400 text-sm">{fmtDate(r.dueDate)}</span>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Paid At',
      render: (r: Invoice) => (
        <span className="text-zinc-400 text-sm">
          {r.paymentDate ? fmtDate(r.paymentDate) : '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Invoices" description="All invoices generated for completed loads" />

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
        <EmptyState title="No invoices found" />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data.data}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => router.push(`/agency/invoices/${r.id}`)}
          />
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
