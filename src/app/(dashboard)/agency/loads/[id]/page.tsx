'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLoad, useAcceptDelivery, useRejectDelivery, useCancelLoad } from '@/lib/hooks/useLoads'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { fmt, fmtDate, fmtDateTime } from '@/lib/utils'
import Link from 'next/link'

export default function AgencyLoadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: load, isLoading } = useLoad(id)
  const acceptDelivery = useAcceptDelivery()
  const rejectDelivery = useRejectDelivery()
  const cancelLoad = useCancelLoad()

  const [rejectReason, setRejectReason] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [actionError, setActionError] = useState('')

  async function handleAccept() {
    setActionError('')
    try {
      await acceptDelivery.mutateAsync(id)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to accept delivery')
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault()
    setActionError('')
    try {
      await rejectDelivery.mutateAsync({ id, reason: rejectReason })
      setShowRejectForm(false)
      setRejectReason('')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject delivery')
    }
  }

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault()
    setActionError('')
    try {
      await cancelLoad.mutateAsync({ id, reason: cancelReason || undefined })
      setShowCancelForm(false)
      setCancelReason('')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel load')
    }
  }

  if (isLoading) return <LoadingState />
  if (!load) return (
    <div className="p-6">
      <p className="text-zinc-500 text-sm">Load not found.</p>
    </div>
  )

  const canAcceptReject = load.status === 'PENDING_DELIVERY_CONFIRMATION'
  const canCancel = load.status === 'DRAFT' || load.status === 'ASSIGNED'

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title={`Load ${load.loadNumber}`}
        description={
          <Link href="/agency/loads" className="text-zinc-500 hover:text-zinc-300 text-sm">
            ← Back to Loads
          </Link>
        }
        action={<StatusBadge status={load.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Route */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-medium text-sm mb-3">Route Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Pickup Location</p>
                <p className="text-zinc-200 text-sm">{load.pickupLocation}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Dropoff Location</p>
                <p className="text-zinc-200 text-sm">{load.dropoffLocation}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Pickup Date</p>
                <p className="text-zinc-200 text-sm">{fmtDate(load.pickupDate)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Delivery Date</p>
                <p className="text-zinc-200 text-sm">{fmtDate(load.deliveryDate)}</p>
              </div>
              {load.notes && (
                <div className="sm:col-span-2">
                  <p className="text-zinc-500 text-xs mb-1">Notes</p>
                  <p className="text-zinc-300 text-sm">{load.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-medium text-sm mb-3">Financials</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Load Rate</p>
                <p className="text-white text-sm font-medium">{fmt(load.loadRate)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Commission %</p>
                <p className="text-zinc-200 text-sm">{load.commissionPercent}%</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Commission</p>
                <p className="text-orange-400 text-sm font-medium">{fmt(load.commissionAmount)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Fleet Earnings</p>
                <p className="text-zinc-200 text-sm font-medium">{fmt(load.fleetEarnings)}</p>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-medium text-sm mb-3">Assignment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Dispatcher</p>
                <p className="text-zinc-200 text-sm">{load.dispatcher?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Fleet</p>
                <p className="text-zinc-200 text-sm">{load.fleet?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Driver</p>
                <p className="text-zinc-200 text-sm">
                  {load.driver ? `${(load.driver as { firstName?: string; lastName?: string }).firstName ?? ''} ${(load.driver as { firstName?: string; lastName?: string }).lastName ?? ''}`.trim() : '—'}
                </p>
              </div>
              {load.vehicle && (
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Vehicle</p>
                  <p className="text-zinc-200 text-sm">
                    {(load.vehicle as { plateNumber?: string }).plateNumber ?? '—'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Completion info */}
          {(load.completedAt || load.cancellationReason || load.podFileUrl) && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-white font-medium text-sm mb-3">Status Info</h2>
              <div className="space-y-3">
                {load.completedAt && (
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">Completed At</p>
                    <p className="text-zinc-200 text-sm">{fmtDateTime(load.completedAt)}</p>
                  </div>
                )}
                {load.cancellationReason && (
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">Cancellation Reason</p>
                    <p className="text-zinc-300 text-sm">{load.cancellationReason}</p>
                  </div>
                )}
                {load.podFileUrl && (
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">Proof of Delivery</p>
                    <a
                      href={load.podFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 text-sm underline"
                    >
                      View POD Document
                    </a>
                  </div>
                )}
                {load.completedAt && (
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">Invoice</p>
                    <Link
                      href={`/agency/invoices?loadId=${load.id}`}
                      className="text-orange-400 hover:text-orange-300 text-sm underline"
                    >
                      View Invoice →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-medium text-sm mb-3">Actions</h2>

            {actionError && (
              <p className="text-red-400 text-xs mb-3">{actionError}</p>
            )}

            {canAcceptReject && (
              <div className="space-y-3">
                <p className="text-zinc-500 text-xs">
                  Fleet has submitted delivery for confirmation.
                </p>
                <button
                  onClick={handleAccept}
                  disabled={acceptDelivery.isPending}
                  className="w-full bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                >
                  {acceptDelivery.isPending ? 'Accepting…' : 'Accept Delivery'}
                </button>
                {!showRejectForm ? (
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm"
                  >
                    Reject Delivery
                  </button>
                ) : (
                  <form onSubmit={handleReject} className="space-y-2">
                    <textarea
                      required
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection…"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={rejectDelivery.isPending}
                        className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                      >
                        {rejectDelivery.isPending ? 'Submitting…' : 'Confirm Reject'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowRejectForm(false); setRejectReason('') }}
                        className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {canCancel && (
              <div className="mt-3 space-y-2">
                {!showCancelForm ? (
                  <button
                    onClick={() => setShowCancelForm(true)}
                    className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm"
                  >
                    Cancel Load
                  </button>
                ) : (
                  <form onSubmit={handleCancel} className="space-y-2">
                    <textarea
                      rows={3}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason (optional)…"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={cancelLoad.isPending}
                        className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                      >
                        {cancelLoad.isPending ? 'Cancelling…' : 'Confirm Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowCancelForm(false); setCancelReason('') }}
                        className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {!canAcceptReject && !canCancel && (
              <p className="text-zinc-600 text-xs">No actions available for this load status.</p>
            )}
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-medium text-sm mb-3">Timeline</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs">Created</span>
                <span className="text-zinc-400 text-xs">{fmtDate(load.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs">Pickup</span>
                <span className="text-zinc-400 text-xs">{fmtDate(load.pickupDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs">Delivery</span>
                <span className="text-zinc-400 text-xs">{fmtDate(load.deliveryDate)}</span>
              </div>
              {load.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 text-xs">Completed</span>
                  <span className="text-green-400 text-xs">{fmtDate(load.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
