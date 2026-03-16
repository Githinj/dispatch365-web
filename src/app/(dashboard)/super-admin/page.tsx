'use client'

import { usePlatformStats } from '@/lib/hooks/useSuperAdmin'
import { StatCard } from '@/components/shared/StatCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { fmt } from '@/lib/utils'

export default function SuperAdminDashboardPage() {
  const { data, isLoading } = usePlatformStats()

  if (isLoading) return <LoadingState />

  return (
    <div className="p-6">
      <PageHeader title="Platform Overview" description="High-level stats across the entire platform." />

      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Agencies"
          value={data?.agencies.total ?? 0}
          sub={`${data?.agencies.active ?? 0} active · ${data?.agencies.suspended ?? 0} suspended`}
        />
        <StatCard
          label="Total Fleets"
          value={data?.fleets.total ?? 0}
        />
        <StatCard
          label="Total Dispatchers"
          value={data?.dispatchers.total ?? 0}
        />
        <StatCard
          label="Total Drivers"
          value={data?.drivers.total ?? 0}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Loads"
          value={data?.loads.total ?? 0}
          sub={`${data?.loads.byStatus?.COMPLETED ?? 0} completed`}
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
        <StatCard
          label="Total Vehicles"
          value={data?.vehicles.total ?? 0}
        />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Gross Load Rate"
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
    </div>
  )
}
