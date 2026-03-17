'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import {
  useLoad,
  useUpdateLoad,
  useAssignLoad,
  useAcceptDelivery,
  useRejectDelivery,
  useCancelLoad,
} from '@/lib/hooks/useLoads'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { fmt, fmtDate, fmtDateTime } from '@/lib/utils'
import type { LoadStatusHistory } from '@/types'

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder:text-zinc-600 transition-colors'

const labelClass = 'block text-zinc-400 text-xs mb-1'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className="text-zinc-200 text-sm text-right max-w-[60%]">{value}</span>
    </div>
  )
}

export default function DispatcherLoadDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string

  const { data: load, isLoading } = useLoad(id)
  const updateLoad = useUpdateLoad()
  const assignLoad = useAssignLoad()
  const acceptDelivery = useAcceptDelivery()
  const rejectDelivery = useRejectDelivery()
  const cancelLoad = useCancelLoad()

  const [showAssignForm, setShowAssignForm] = useState(false)
  const [assignForm, setAssignForm] = useState({ fleetId: '', driverId: '', vehicleId: '' })

  const [showEditForm, setShowEditForm] = useState(false)
  const [editForm, setEditForm] = useState({
    loadNumber: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    deliveryDate: '',
    loadRate: '',
    notes: '',
  })

  useEffect(() => {
    if (load && load.status === 'DRAFT' && searchParams.get('edit') === '1') {
      openEditForm()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  function openEditForm() {
    if (!load) return
    setEditForm({
      loadNumber:      load.loadNumber ?? '',
      pickupLocation:  load.pickupLocation,
      dropoffLocation: load.dropoffLocation,
      pickupDate:      load.pickupDate ? load.pickupDate.slice(0, 10) : '',
      deliveryDate:    load.deliveryDate ? load.deliveryDate.slice(0, 10) : '',
      loadRate:        String(load.loadRate),
      notes:           load.notes ?? '',
    })
    setShowEditForm(true)
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateLoad.mutate(
      {
        id,
        data: {
          ...(editForm.loadNumber ? { loadNumber: editForm.loadNumber } : {}),
          pickupLocation:  editForm.pickupLocation,
          dropoffLocation: editForm.dropoffLocation,
          pickupDate:      new Date(editForm.pickupDate + 'T12:00:00Z').toISOString(),
          deliveryDate:    new Date(editForm.deliveryDate + 'T12:00:00Z').toISOString(),
          loadRate:        parseFloat(editForm.loadRate),
          ...(editForm.notes ? { notes: editForm.notes } : {}),
        },
      },
      { onSuccess: () => setShowEditForm(false) }
    )
  }

  function handleAssignChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAssignForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    assignLoad.mutate(
      { id, data: assignForm },
      { onSuccess: () => setShowAssignForm(false) }
    )
  }

  function handleAccept() {
    if (confirm('Accept this delivery and mark load as completed?')) {
      acceptDelivery.mutate(id)
    }
  }

  function handleReject() {
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      rejectDelivery.mutate({ id, reason })
    }
  }

  function handleCancel() {
    const reason = prompt('Enter cancellation reason (optional):') ?? undefined
    cancelLoad.mutate({ id, reason: reason || undefined })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    )
  }

  if (!load) {
    return (
      <div className="p-6">
        <p className="text-zinc-500 text-sm">Load not found.</p>
      </div>
    )
  }

  const canCancel = load.status === 'DRAFT' || load.status === 'ASSIGNED'
  const canAssign = load.status === 'DRAFT'
  const canEdit   = load.status === 'DRAFT'
  const pendingConfirmation = load.status === 'PENDING_DELIVERY_CONFIRMATION'

  return (
    <div className="p-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {load.loadNumber ?? load.serialNumber}
            <StatusBadge status={load.status} />
          </span>
        }
        description={`${load.pickupLocation} → ${load.dropoffLocation}`}
        action={
          <Link
            href="/dispatcher/loads"
            className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            ← My Loads
          </Link>
        }
      />

      {/* Action Bar */}
      {(canAssign || canEdit || canCancel || pendingConfirmation) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {canEdit && !showEditForm && (
            <button
              onClick={openEditForm}
              className="border border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Edit Load
            </button>
          )}
          {canAssign && !showAssignForm && (
            <button
              onClick={() => setShowAssignForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Assign Load
            </button>
          )}
          {pendingConfirmation && (
            <>
              <button
                onClick={handleAccept}
                disabled={acceptDelivery.isPending}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {acceptDelivery.isPending ? 'Accepting…' : 'Accept Delivery'}
              </button>
              <button
                onClick={handleReject}
                disabled={rejectDelivery.isPending}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                {rejectDelivery.isPending ? 'Rejecting…' : 'Reject Delivery'}
              </button>
            </>
          )}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelLoad.isPending}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              {cancelLoad.isPending ? 'Cancelling…' : 'Cancel Load'}
            </button>
          )}
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-6">
          <p className="text-white font-medium text-sm mb-4">Edit Load</p>
          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="edit-loadNumber">Load Number</label>
                <input
                  id="edit-loadNumber"
                  name="loadNumber"
                  type="text"
                  value={editForm.loadNumber}
                  onChange={handleEditChange}
                  placeholder="e.g. BOL-2026-001"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-pickupLocation">Pickup Location</label>
                <input
                  id="edit-pickupLocation"
                  name="pickupLocation"
                  type="text"
                  required
                  value={editForm.pickupLocation}
                  onChange={handleEditChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-dropoffLocation">Dropoff Location</label>
                <input
                  id="edit-dropoffLocation"
                  name="dropoffLocation"
                  type="text"
                  required
                  value={editForm.dropoffLocation}
                  onChange={handleEditChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-pickupDate">Pickup Date</label>
                <input
                  id="edit-pickupDate"
                  name="pickupDate"
                  type="date"
                  required
                  value={editForm.pickupDate}
                  onChange={handleEditChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-deliveryDate">Delivery Date</label>
                <input
                  id="edit-deliveryDate"
                  name="deliveryDate"
                  type="date"
                  required
                  value={editForm.deliveryDate}
                  onChange={handleEditChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-loadRate">Load Rate (USD)</label>
                <input
                  id="edit-loadRate"
                  name="loadRate"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={editForm.loadRate}
                  onChange={handleEditChange}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="edit-notes">Notes <span className="text-zinc-600 text-xs">(optional)</span></label>
                <textarea
                  id="edit-notes"
                  name="notes"
                  rows={3}
                  value={editForm.notes}
                  onChange={handleEditChange}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={updateLoad.isPending}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {updateLoad.isPending ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Form */}
      {showAssignForm && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-6">
          <p className="text-white font-medium text-sm mb-4">Assign Load</p>
          <form onSubmit={handleAssign}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass} htmlFor="fleetId">Fleet ID</label>
                <input
                  id="fleetId"
                  name="fleetId"
                  type="text"
                  required
                  placeholder="Fleet ID"
                  value={assignForm.fleetId}
                  onChange={handleAssignChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="driverId">Driver ID</label>
                <input
                  id="driverId"
                  name="driverId"
                  type="text"
                  required
                  placeholder="Driver ID"
                  value={assignForm.driverId}
                  onChange={handleAssignChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="vehicleId">Vehicle ID</label>
                <input
                  id="vehicleId"
                  name="vehicleId"
                  type="text"
                  required
                  placeholder="Vehicle ID"
                  value={assignForm.vehicleId}
                  onChange={handleAssignChange}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={assignLoad.isPending}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {assignLoad.isPending ? 'Assigning…' : 'Confirm Assignment'}
              </button>
              <button
                type="button"
                onClick={() => setShowAssignForm(false)}
                className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Load Info */}
        <div className="space-y-5">
          {/* Load Details Card */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <p className="text-white font-medium text-sm mb-3">Load Details</p>
            {load.loadNumber && <InfoRow label="Load Number" value={load.loadNumber} />}
            <InfoRow label="Serial Number" value={load.serialNumber} />
            <InfoRow label="Pickup Location" value={load.pickupLocation} />
            <InfoRow label="Dropoff Location" value={load.dropoffLocation} />
            <InfoRow label="Pickup Date" value={fmtDate(load.pickupDate)} />
            <InfoRow label="Delivery Date" value={fmtDate(load.deliveryDate)} />
            <InfoRow label="Load Rate" value={fmt(load.loadRate)} />
            <InfoRow
              label="Commission"
              value={`${load.commissionPercent}% — ${fmt(load.commissionAmount)}`}
            />
            <InfoRow label="Fleet Earnings" value={fmt(load.fleetEarnings)} />
            <InfoRow label="Your Earnings" value={
              <span className="text-orange-400 font-medium">{fmt(load.dispatcherEarnings)}</span>
            } />
            {load.notes && <InfoRow label="Notes" value={load.notes} />}
            {load.podFileUrl && (
              <InfoRow
                label="Proof of Delivery"
                value={
                  <a
                    href={load.podFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 underline text-sm"
                  >
                    View POD
                  </a>
                }
              />
            )}
          </div>

          {/* Timestamps Card */}
          {(load.tripStartedAt || load.deliverySubmittedAt || load.deliveryAcceptedAt || load.completedAt || load.cancelledAt) && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <p className="text-white font-medium text-sm mb-3">Timestamps</p>
              {load.tripStartedAt && <InfoRow label="Trip Started" value={fmtDateTime(load.tripStartedAt)} />}
              {load.deliverySubmittedAt && <InfoRow label="Delivery Submitted" value={fmtDateTime(load.deliverySubmittedAt)} />}
              {load.deliveryAcceptedAt && <InfoRow label="Delivery Accepted" value={fmtDateTime(load.deliveryAcceptedAt)} />}
              {load.completedAt && <InfoRow label="Completed" value={fmtDateTime(load.completedAt)} />}
              {load.cancelledAt && <InfoRow label="Cancelled" value={fmtDateTime(load.cancelledAt)} />}
              {load.cancellationReason && <InfoRow label="Cancellation Reason" value={load.cancellationReason} />}
            </div>
          )}
        </div>

        {/* Right: Assignment + Status History */}
        <div className="space-y-5">
          {/* Assignment Card */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <p className="text-white font-medium text-sm mb-3">Assignment</p>
            {load.fleet || load.driver || load.vehicle ? (
              <>
                {load.fleet && <InfoRow label="Fleet" value={load.fleet.name} />}
                {load.driver && (
                  <InfoRow
                    label="Driver"
                    value={
                      <span>
                        {load.driver.name}
                        {load.driver.phone && (
                          <span className="text-zinc-500 ml-1 text-xs">{load.driver.phone}</span>
                        )}
                      </span>
                    }
                  />
                )}
                {load.vehicle && (
                  <InfoRow
                    label="Vehicle"
                    value={`${load.vehicle.make} ${load.vehicle.model} — ${load.vehicle.plateNumber}`}
                  />
                )}
                {load.vehicle && (
                  <InfoRow label="Vehicle Type" value={load.vehicle.vehicleType.replace('_', ' ')} />
                )}
              </>
            ) : (
              <p className="text-zinc-600 text-sm">Not yet assigned.</p>
            )}
          </div>

          {/* Status History Timeline */}
          {load.statusHistory && load.statusHistory.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <p className="text-white font-medium text-sm mb-4">Status History</p>
              <div className="space-y-0">
                {load.statusHistory.map((entry: LoadStatusHistory, idx: number) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                      {idx < load.statusHistory!.length - 1 && (
                        <div className="w-px flex-1 bg-white/[0.06] my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <StatusBadge status={entry.status} />
                      </div>
                      <p className="text-zinc-500 text-xs">{fmtDateTime(entry.changedAt)}</p>
                      {entry.note && (
                        <p className="text-zinc-400 text-xs mt-1">{entry.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
