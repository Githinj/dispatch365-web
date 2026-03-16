'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { LoadingState } from '@/components/shared/LoadingState'
import { usePlatformStats } from '@/lib/hooks/useSuperAdmin'
import { fmt } from '@/lib/utils'

export default function SuperAdminFinancialsPage() {
  const { data, isLoading } = usePlatformStats()

  if (isLoading) return <LoadingState />

  const byStatus = data?.loads.byStatus ?? {}

  return (
    <div className="p-6">
      <PageHeader title="Financials" description="Platform-wide financial overview." />

      {/* Row 1: Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Gross Load Rate"
          value={fmt(data?.revenue.totalGrossLoadRate ?? 0)}
          accent={true}
        />
        <StatCard
          label="Total Commission"
          value={fmt(data?.revenue.totalCommission ?? 0)}
          accent={true}
        />
        <StatCard
          label="Total Fleet Earnings"
          value={fmt(data?.revenue.totalFleetEarnings ?? 0)}
          accent={true}
        />
      </div>

      {/* Row 2: Invoices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Invoices"
          value={data?.invoices.total ?? 0}
        />
        <StatCard
          label="Unpaid Invoices"
          value={data?.invoices.unpaid ?? 0}
          accent={true}
        />
        <StatCard
          label="Overdue Invoices"
          value={data?.invoices.overdue ?? 0}
          accent={true}
        />
      </div>

      {/* Loads by Status */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <p className="text-white font-medium text-sm mb-4">Loads by Status</p>
        {Object.keys(byStatus).length === 0 ? (
          <p className="text-zinc-500 text-sm">No load data available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-3"
              >
                <span className="text-zinc-400 text-sm font-medium uppercase tracking-wide text-xs">
                  {status.replace(/_/g, ' ')}
                </span>
                <span className="text-white font-semibold text-lg">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
