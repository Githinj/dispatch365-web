'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useLoads } from '@/lib/hooks/useLoads'
import { useDrivers } from '@/lib/hooks/useDrivers'
import { useVehicles } from '@/lib/hooks/useVehicles'
import { useInvoices } from '@/lib/hooks/useInvoices'
import { useAuthStore } from '@/store/auth.store'
import { fmtDate } from '@/lib/utils'
import type { Load } from '@/types'

export default function FleetDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const { data: loadsData, isLoading: loadsLoading } = useLoads({ perPage: 1 })
  const { data: driversData, isLoading: driversLoading } = useDrivers({ status: 'ACTIVE', perPage: 1 })
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles({ status: 'AVAILABLE', perPage: 1 })
  const { data: unpaidData, isLoading: unpaidLoading } = useInvoices({ status: 'UNPAID', perPage: 1 })
  const { data: overdueData } = useInvoices({ status: 'OVERDUE', perPage: 1 })

  const { data: recentLoads, isLoading: recentLoading } = useLoads({ perPage: 5 })

  const pendingInvoices = (unpaidData?.meta?.total ?? 0) + (overdueData?.meta?.total ?? 0)

  const statsLoading = loadsLoading || driversLoading || vehiclesLoading || unpaidLoading

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
      header: 'Date',
      render: (row: Load) => (
        <span className="text-zinc-400 text-xs">{fmtDate(row.pickupDate)}</span>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Fleet Dashboard"
        description={`Welcome back${user?.name ? `, ${user.name}` : ''}. Here's an overview of your fleet.`}
      />

      {statsLoading ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Loads"
            value={loadsData?.meta?.total ?? 0}
            sub="All time"
            accent
          />
          <StatCard
            label="Active Drivers"
            value={driversData?.meta?.total ?? 0}
            sub="Currently active"
          />
          <StatCard
            label="Available Vehicles"
            value={vehiclesData?.meta?.total ?? 0}
            sub="Ready to dispatch"
          />
          <StatCard
            label="Pending Invoices"
            value={pendingInvoices}
            sub="Unpaid + Overdue"
          />
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
        <p className="text-white font-medium text-sm mb-3">Recent Loads</p>
        {recentLoading ? (
          <LoadingState />
        ) : !recentLoads?.data?.length ? (
          <EmptyState title="No loads found." />
        ) : (
          <DataTable
            columns={columns}
            data={recentLoads.data}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => router.push(`/fleet/loads/${r.id}`)}
          />
        )}
      </div>
    </div>
  )
}
