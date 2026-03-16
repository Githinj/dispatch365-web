'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { useLoad } from '@/lib/hooks/useLoads'
import { fmt, fmtDate, fmtDateTime } from '@/lib/utils'

export default function FleetLoadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: load, isLoading } = useLoad(id)

  if (isLoading) return <div className="p-6"><LoadingState /></div>
  if (!load) return (
    <div className="p-6">
      <p className="text-zinc-500">Load not found.</p>
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link
          href="/fleet/loads"
          className="text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-1 transition-colors"
        >
          ← Back to Loads
        </Link>
      </div>

      <PageHeader
        title={`Load ${load.loadNumber}`}
        description="Load details — read only"
        action={<StatusBadge status={load.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Load Info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white font-medium text-sm mb-3">Load Information</p>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Load #</dt>
              <dd className="text-orange-400 font-medium text-sm">{load.loadNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Status</dt>
              <dd><StatusBadge status={load.status} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Pickup Location</dt>
              <dd className="text-zinc-300 text-sm text-right max-w-[60%]">{load.pickupLocation}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Dropoff Location</dt>
              <dd className="text-zinc-300 text-sm text-right max-w-[60%]">{load.dropoffLocation}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Pickup Date</dt>
              <dd className="text-zinc-300 text-sm">{fmtDate(load.pickupDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Delivery Date</dt>
              <dd className="text-zinc-300 text-sm">{load.deliveryDate ? fmtDate(load.deliveryDate) : '—'}</dd>
            </div>
            {load.completedAt && (
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Completed At</dt>
                <dd className="text-zinc-300 text-sm">{fmtDateTime(load.completedAt)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Created</dt>
              <dd className="text-zinc-300 text-sm">{fmtDateTime(load.createdAt)}</dd>
            </div>
            {load.notes && (
              <div className="pt-2 border-t border-white/[0.06]">
                <dt className="text-zinc-500 text-sm mb-1">Notes</dt>
                <dd className="text-zinc-300 text-sm">{load.notes}</dd>
              </div>
            )}
            {load.podFileUrl && (
              <div className="pt-2 border-t border-white/[0.06]">
                <dt className="text-zinc-500 text-sm mb-1">Proof of Delivery</dt>
                <dd>
                  <a
                    href={load.podFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 text-sm underline"
                  >
                    View POD Document
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Assignment & Financials */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white font-medium text-sm mb-3">Assignment</p>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Dispatcher</dt>
                <dd className="text-zinc-300 text-sm">{load.dispatcher?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Driver</dt>
                <dd className="text-zinc-300 text-sm">{load.driver?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Vehicle</dt>
                <dd className="text-zinc-300 text-sm">
                  {load.vehicle ? `${load.vehicle.make} ${load.vehicle.model} (${load.vehicle.plateNumber})` : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Fleet</dt>
                <dd className="text-zinc-300 text-sm">{load.fleet?.name ?? '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white font-medium text-sm mb-3">Financials</p>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Load Rate</dt>
                <dd className="text-zinc-300 text-sm font-medium">{fmt(load.loadRate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Commission</dt>
                <dd className="text-zinc-300 text-sm">
                  {load.commissionPercent}% ({fmt(load.commissionAmount)})
                </dd>
              </div>
              <div className="flex justify-between border-t border-white/[0.06] pt-3">
                <dt className="text-zinc-500 text-sm font-medium">Fleet Earnings</dt>
                <dd className="text-green-400 text-sm font-semibold">{fmt(load.fleetEarnings)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Dispatcher Earnings</dt>
                <dd className="text-zinc-300 text-sm">{fmt(load.dispatcherEarnings)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
