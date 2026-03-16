'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  useVehicle,
  useUpdateVehicle,
  useStartMaintenance,
  useCompleteMaintenance,
} from '@/lib/hooks/useVehicles'
import { useLoads } from '@/lib/hooks/useLoads'
import { fmt, fmtDate, fmtDateTime } from '@/lib/utils'
import type { VehicleType } from '@/types'

const VEHICLE_TYPES: VehicleType[] = ['SEMI', 'FLATBED', 'REEFER', 'BOX_TRUCK', 'TANKER', 'OTHER']

export default function FleetVehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: vehicle, isLoading } = useVehicle(id)
  const { data: currentLoadData, isLoading: loadLoading } = useLoads({
    vehicleId: id,
    status: 'IN_TRANSIT',
    perPage: 1,
  })
  const updateVehicle = useUpdateVehicle()
  const startMaintenance = useStartMaintenance()
  const completeMaintenance = useCompleteMaintenance()

  const [showEditForm, setShowEditForm] = useState(false)
  const [editForm, setEditForm] = useState({
    make: '',
    model: '',
    year: '',
    plateNumber: '',
    vinNumber: '',
    vehicleType: '' as VehicleType | '',
    capacityTons: '',
  })
  const [editError, setEditError] = useState('')

  const openEditForm = () => {
    if (!vehicle) return
    setEditForm({
      make: vehicle.make,
      model: vehicle.model,
      year: String(vehicle.year),
      plateNumber: vehicle.plateNumber,
      vinNumber: vehicle.vinNumber ?? '',
      vehicleType: vehicle.vehicleType,
      capacityTons: vehicle.capacityTons != null ? String(vehicle.capacityTons) : '',
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')
    if (!editForm.make.trim() || !editForm.model.trim() || !editForm.year || !editForm.plateNumber.trim() || !editForm.vehicleType) {
      setEditError('Make, model, year, plate number, and vehicle type are required.')
      return
    }
    try {
      await updateVehicle.mutateAsync({
        id,
        data: {
          make: editForm.make.trim(),
          model: editForm.model.trim(),
          year: parseInt(editForm.year),
          plateNumber: editForm.plateNumber.trim(),
          ...(editForm.vinNumber.trim() ? { vinNumber: editForm.vinNumber.trim() } : {}),
          vehicleType: editForm.vehicleType as VehicleType,
          ...(editForm.capacityTons ? { capacityTons: parseFloat(editForm.capacityTons) } : {}),
        },
      })
      setShowEditForm(false)
    } catch {
      setEditError('Failed to update vehicle. Please try again.')
    }
  }

  if (isLoading) return <div className="p-6"><LoadingState /></div>
  if (!vehicle) return (
    <div className="p-6">
      <p className="text-zinc-500">Vehicle not found.</p>
    </div>
  )

  const currentLoad = currentLoadData?.data?.[0]

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link
          href="/fleet/vehicles"
          className="text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-1 transition-colors"
        >
          ← Back to Vehicles
        </Link>
      </div>

      <PageHeader
        title={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
        description={`Plate: ${vehicle.plateNumber}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={vehicle.status} />
            {vehicle.status === 'AVAILABLE' && (
              <button
                onClick={() => startMaintenance.mutate({ id: vehicle.id })}
                disabled={startMaintenance.isPending}
                className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
              >
                {startMaintenance.isPending ? 'Starting...' : 'Start Maintenance'}
              </button>
            )}
            {vehicle.status === 'UNDER_MAINTENANCE' && (
              <button
                onClick={() => completeMaintenance.mutate({ id: vehicle.id })}
                disabled={completeMaintenance.isPending}
                className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
              >
                {completeMaintenance.isPending ? 'Completing...' : 'Complete Maintenance'}
              </button>
            )}
            <button
              onClick={openEditForm}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Edit Vehicle
            </button>
          </div>
        }
      />

      {showEditForm && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4">
          <p className="text-white font-medium text-sm mb-3">Edit Vehicle</p>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Make *"
              value={editForm.make}
              onChange={(e) => setEditForm((f) => ({ ...f, make: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <input
              type="text"
              placeholder="Model *"
              value={editForm.model}
              onChange={(e) => setEditForm((f) => ({ ...f, model: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <input
              type="number"
              placeholder="Year *"
              value={editForm.year}
              onChange={(e) => setEditForm((f) => ({ ...f, year: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <input
              type="text"
              placeholder="Plate Number *"
              value={editForm.plateNumber}
              onChange={(e) => setEditForm((f) => ({ ...f, plateNumber: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <input
              type="text"
              placeholder="VIN Number (optional)"
              value={editForm.vinNumber}
              onChange={(e) => setEditForm((f) => ({ ...f, vinNumber: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <select
              value={editForm.vehicleType}
              onChange={(e) => setEditForm((f) => ({ ...f, vehicleType: e.target.value as VehicleType }))}
              className="w-full bg-[#0a0a0f] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            >
              <option value="">Vehicle Type *</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Capacity (tons, optional)"
              value={editForm.capacityTons}
              onChange={(e) => setEditForm((f) => ({ ...f, capacityTons: e.target.value }))}
              step="0.1"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            {editError && (
              <p className="text-red-400 text-xs sm:col-span-2 lg:col-span-4">{editError}</p>
            )}
            <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
              <button
                type="submit"
                disabled={updateVehicle.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {updateVehicle.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => { setShowEditForm(false); setEditError('') }}
                className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vehicle Info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white font-medium text-sm mb-3">Vehicle Details</p>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Make</dt>
              <dd className="text-zinc-300 text-sm">{vehicle.make}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Model</dt>
              <dd className="text-zinc-300 text-sm">{vehicle.model}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Year</dt>
              <dd className="text-zinc-300 text-sm">{vehicle.year}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Plate Number</dt>
              <dd className="text-zinc-300 text-sm font-mono">{vehicle.plateNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">VIN</dt>
              <dd className="text-zinc-300 text-sm font-mono">{vehicle.vinNumber ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Type</dt>
              <dd className="text-zinc-300 text-sm">{vehicle.vehicleType.replace('_', ' ')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Capacity</dt>
              <dd className="text-zinc-300 text-sm">{vehicle.capacityTons != null ? `${vehicle.capacityTons} tons` : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Status</dt>
              <dd><StatusBadge status={vehicle.status} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Insurance Expiry</dt>
              <dd className="text-zinc-300 text-sm">{vehicle.insuranceExpiry ? fmtDate(vehicle.insuranceExpiry) : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Inspection Expiry</dt>
              <dd className="text-zinc-300 text-sm">{vehicle.inspectionExpiry ? fmtDate(vehicle.inspectionExpiry) : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 text-sm">Added</dt>
              <dd className="text-zinc-300 text-sm">{fmtDateTime(vehicle.createdAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Current Load */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white font-medium text-sm mb-3">Current Load</p>
          {vehicle.status !== 'ON_LOAD' ? (
            <EmptyState title="Vehicle is not currently on a load." />
          ) : loadLoading ? (
            <LoadingState />
          ) : !currentLoad ? (
            <EmptyState title="No active load found." />
          ) : (
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Load #</dt>
                <dd className="text-orange-400 font-medium text-sm">{currentLoad.loadNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Status</dt>
                <dd><StatusBadge status={currentLoad.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Driver</dt>
                <dd className="text-zinc-300 text-sm">{currentLoad.driver?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Pickup</dt>
                <dd className="text-zinc-300 text-sm text-right max-w-[60%]">{currentLoad.pickupLocation}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Dropoff</dt>
                <dd className="text-zinc-300 text-sm text-right max-w-[60%]">{currentLoad.dropoffLocation}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Delivery Date</dt>
                <dd className="text-zinc-300 text-sm">{currentLoad.deliveryDate ? fmtDate(currentLoad.deliveryDate) : '—'}</dd>
              </div>
              <div className="flex justify-between border-t border-white/[0.06] pt-3">
                <dt className="text-zinc-500 text-sm">Fleet Earnings</dt>
                <dd className="text-green-400 font-semibold text-sm">{fmt(currentLoad.fleetEarnings)}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}
