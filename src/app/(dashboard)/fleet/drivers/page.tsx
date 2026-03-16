'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useDrivers, useInviteDriver, useDeactivateDriver, useReactivateDriver } from '@/lib/hooks/useDrivers'
import { fmtDate } from '@/lib/utils'
import type { Driver } from '@/types'

export default function FleetDriversPage() {
  const [page, setPage] = useState(1)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', phone: '' })
  const [inviteError, setInviteError] = useState('')

  const { data, isLoading } = useDrivers({ page, perPage: 20 })
  const inviteDriver = useInviteDriver()
  const deactivateDriver = useDeactivateDriver()
  const reactivateDriver = useReactivateDriver()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError('')
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      setInviteError('Name and email are required.')
      return
    }
    try {
      await inviteDriver.mutateAsync({
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim(),
        ...(inviteForm.phone.trim() ? { phone: inviteForm.phone.trim() } : {}),
      })
      setInviteForm({ name: '', email: '', phone: '' })
      setShowInviteForm(false)
    } catch {
      setInviteError('Failed to invite driver. Please try again.')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row: Driver) => (
        <span className="text-zinc-200 font-medium">{row.name}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row: Driver) => (
        <span className="text-zinc-400 text-sm">{row.email}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row: Driver) => (
        <span className="text-zinc-400 text-sm">{row.phone ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Driver) => <StatusBadge status={row.status} />,
    },
    {
      key: 'licenseNumber',
      header: 'License #',
      render: (row: Driver) => (
        <span className="text-zinc-400 text-sm">{row.licenseNumber ?? '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row: Driver) => (
        <span className="text-zinc-500 text-xs">{fmtDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Driver) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {row.status === 'ACTIVE' && (
            <button
              onClick={() => deactivateDriver.mutate(row.id)}
              disabled={deactivateDriver.isPending}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
            >
              Deactivate
            </button>
          )}
          {row.status === 'INACTIVE' && (
            <button
              onClick={() => reactivateDriver.mutate(row.id)}
              disabled={reactivateDriver.isPending}
              className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
            >
              Reactivate
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Drivers"
        description="Manage your fleet drivers."
        action={
          <button
            onClick={() => setShowInviteForm((v) => !v)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {showInviteForm ? 'Cancel' : 'Invite Driver'}
          </button>
        }
      />

      {showInviteForm && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4">
          <p className="text-white font-medium text-sm mb-3">Invite New Driver</p>
          <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Full name *"
              value={inviteForm.name}
              onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <input
              type="email"
              placeholder="Email address *"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={inviteForm.phone}
              onChange={(e) => setInviteForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            {inviteError && (
              <p className="text-red-400 text-xs sm:col-span-3">{inviteError}</p>
            )}
            <div className="sm:col-span-3 flex gap-2">
              <button
                type="submit"
                disabled={inviteDriver.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {inviteDriver.isPending ? 'Sending...' : 'Send Invite'}
              </button>
              <button
                type="button"
                onClick={() => { setShowInviteForm(false); setInviteError('') }}
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
          <div className="p-6"><EmptyState title="No drivers found. Invite your first driver." /></div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data.data}
              keyExtractor={(r) => r.id}
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
