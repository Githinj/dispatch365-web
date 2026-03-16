'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  useVehicles,
  useCreateVehicle,
  useStartMaintenance,
  useCompleteMaintenance,
} from '@/lib/hooks/useVehicles'
import { fmtDate } from '@/lib/utils'
import type { Vehicle, VehicleType } from '@/types'

const VEHICLE_TYPES: VehicleType[] = ['SEMI', 'FLATBED', 'REEFER', 'BOX_TRUCK', 'TANKER', 'OTHER']

const defaultForm = {
  make: '',
  model: '',
  year: '',
  plateNumber: '',
  vinNumber: '',
  vehicleType: '' as VehicleType | '',
  capacityTons: '',
}

export default function FleetVehiclesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [formError, setFormError] = useState('')

  const { data, isLoading } = useVehicles({ page, perPage: 20 })
  const createVehicle = useCreateVehicle()
  const startMaintenance = useStartMaintenance()
  const completeMaintenance = useCompleteMaintenance()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.make.trim() || !form.model.trim() || !form.year || !form.plateNumber.trim() || !form.vehicleType) {
      setFormError('Make, model, year, plate number, and vehicle type are required.')
      return
    }
    try {
      await createVehicle.mutateAsync({
        make: form.make.trim(),
        model: form.model.trim(),
        year: parseInt(form.year),
        plateNumber: form.plateNumber.trim(),
        ...(form.vinNumber.trim() ? { vinNumber: form.vinNumber.trim() } : {}),
        vehicleType: form.vehicleType as VehicleType,
        ...(form.capacityTons ? { capacityTons: parseFloat(form.capacityTons) } : {}),
      })
      setForm(defaultForm)
      setShowAddForm(false)
    } catch {
      setFormError('Failed to add vehicle. Please try again.')
    }
  }

  const columns = [
    {
      key: 'makeModel',
      header: 'Make / Model',
      render: (row: Vehicle) => (
        <div>
          <span className="text-zinc-200 font-medium">{row.make} {row.model}</span>
          <span className="text-zinc-500 text-xs ml-2">({row.year})</span>
        </div>
      ),
    },
    {
      key: 'plateNumber',
      header: 'Plate',
      render: (row: Vehicle) => (
        <span className="text-zinc-300 font-mono text-sm">{row.plateNumber}</span>
      ),
    },
    {
      key: 'vehicleType',
      header: 'Type',
      render: (row: Vehicle) => (
        <span className="text-zinc-400 text-sm">{row.vehicleType.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Vehicle) => <StatusBadge status={row.status} />,
    },
    {
      key: 'capacityTons',
      header: 'Capacity',
      render: (row: Vehicle) => (
        <span className="text-zinc-400 text-sm">{row.capacityTons != null ? `${row.capacityTons}t` : '—'}</span>
      ),
    },
    {
      key: 'insuranceExpiry',
      header: 'Insurance Exp.',
      render: (row: Vehicle) => (
        <span className="text-zinc-400 text-xs">{row.insuranceExpiry ? fmtDate(row.insuranceExpiry) : '—'}</span>
      ),
    },
    {
      key: 'inspectionExpiry',
      header: 'Inspection Exp.',
      render: (row: Vehicle) => (
        <span className="text-zinc-400 text-xs">{row.inspectionExpiry ? fmtDate(row.inspectionExpiry) : '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Vehicle) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {row.status === 'AVAILABLE' && (
            <button
              onClick={() => startMaintenance.mutate({ id: row.id })}
              disabled={startMaintenance.isPending}
              className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
            >
              Start Maint.
            </button>
          )}
          {row.status === 'UNDER_MAINTENANCE' && (
            <button
              onClick={() => completeMaintenance.mutate({ id: row.id })}
              disabled={completeMaintenance.isPending}
              className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
            >
              Complete Maint.
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Vehicles"
        description="Manage your fleet vehicles."
        action={
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {showAddForm ? 'Cancel' : 'Add Vehicle'}
          </button>
        }
      />

      {showAddForm && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4">
          <p className="text-white font-medium text-sm mb-3">Add New Vehicle</p>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Make *"
              value={form.make}
              onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <input
              type="text"
              placeholder="Model *"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <input
              type="number"
              placeholder="Year *"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <input
              type="text"
              placeholder="Plate Number *"
              value={form.plateNumber}
              onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <input
              type="text"
              placeholder="VIN Number (optional)"
              value={form.vinNumber}
              onChange={(e) => setForm((f) => ({ ...f, vinNumber: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <select
              value={form.vehicleType}
              onChange={(e) => setForm((f) => ({ ...f, vehicleType: e.target.value as VehicleType }))}
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
              value={form.capacityTons}
              onChange={(e) => setForm((f) => ({ ...f, capacityTons: e.target.value }))}
              step="0.1"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            {formError && (
              <p className="text-red-400 text-xs sm:col-span-2 lg:col-span-4">{formError}</p>
            )}
            <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
              <button
                type="submit"
                disabled={createVehicle.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {createVehicle.isPending ? 'Adding...' : 'Add Vehicle'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setFormError('') }}
                className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl">
        {isLoading ? (
          <div className="p-6"><LoadingState /></div>
        ) : !data?.data?.length ? (
          <div className="p-6"><EmptyState title="No vehicles found. Add your first vehicle." /></div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data.data}
              keyExtractor={(r) => r.id}
              onRowClick={(r) => router.push(`/fleet/vehicles/${r.id}`)}
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
