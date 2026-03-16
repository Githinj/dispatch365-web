'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useDriver, useDeactivateDriver, useReactivateDriver } from '@/lib/hooks/useDrivers'
import { useLoads } from '@/lib/hooks/useLoads'
import { fmt, fmtDate, fmtDateTime } from '@/lib/utils'
import type { Load } from '@/types'

export default function FleetDriverDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: driver, isLoading } = useDriver(id)
  const { data: loadsData, isLoading: loadsLoading } = useLoads({ driverId: id, perPage: 10 })
  const deactivateDriver = useDeactivateDriver()
  const reactivateDriver = useReactivateDriver()

  if (isLoading) return <div className="p-6"><LoadingState /></div>
  if (!driver) return (
    <div className="p-6">
      <p className="text-zinc-500">Driver not found.</p>
    </div>
  )

  const loadsColumns = [
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
    {
      key: 'fleetEarnings',
      header: 'Fleet Earnings',
      render: (row: Load) => (
        <span className="text-green-400 text-sm font-medium">{fmt(row.fleetEarnings)}</span>
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link
          href="/fleet/drivers"
          className="text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-1 transition-colors"
        >
          ← Back to Drivers
        </Link>
      </div>

      <PageHeader
        title={driver.name}
        description="Driver profile"
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={driver.status} />
            {driver.status === 'ACTIVE' && (
              <button
                onClick={() => deactivateDriver.mutate(driver.id)}
                disabled={deactivateDriver.isPending}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
              >
                {deactivateDriver.isPending ? 'Deactivating...' : 'Deactivate'}
              </button>
            )}
            {driver.status === 'INACTIVE' && (
              <button
                onClick={() => reactivateDriver.mutate(driver.id)}
                disabled={reactivateDriver.isPending}
                className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
              >
                {reactivateDriver.isPending ? 'Reactivating...' : 'Reactivate'}
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white font-medium text-sm mb-3">Driver Information</p>
          <dl className="space-y-3">
            <div>
              <dt className="text-zinc-500 text-xs mb-0.5">Email</dt>
              <dd className="text-zinc-300 text-sm">{driver.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs mb-0.5">Phone</dt>
              <dd className="text-zinc-300 text-sm">{driver.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs mb-0.5">License Number</dt>
              <dd className="text-zinc-300 text-sm">{driver.licenseNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs mb-0.5">Status</dt>
              <dd><StatusBadge status={driver.status} /></dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs mb-0.5">Fleet ID</dt>
              <dd className="text-zinc-400 text-xs font-mono">{driver.fleetId}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs mb-0.5">Joined</dt>
              <dd className="text-zinc-300 text-sm">{fmtDateTime(driver.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white font-medium text-sm mb-3">Recent Loads</p>
          {loadsLoading ? (
            <LoadingState />
          ) : !loadsData?.data?.length ? (
            <EmptyState title="No loads found for this driver." />
          ) : (
            <DataTable
              columns={loadsColumns}
              data={loadsData.data}
              keyExtractor={(r) => r.id}
            />
          )}
        </div>
      </div>
    </div>
  )
}
