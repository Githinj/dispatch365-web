'use client'

import { useState } from 'react'
import { useDispatchers, useCreateDispatcher, useDeactivateDispatcher } from '@/lib/hooks/useDispatchers'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Dispatcher } from '@/types'

export default function AgencyDispatchersPage() {
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [formError, setFormError] = useState('')
  const [credentials, setCredentials] = useState<{ email: string; password: string; name: string } | null>(null)

  const { data, isLoading } = useDispatchers({ page, perPage: 20 })
  const createDispatcher = useCreateDispatcher()
  const deactivateDispatcher = useDeactivateDispatcher()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    try {
      const result = await createDispatcher.mutateAsync({
        name:  formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
      }) as any
      const d = result.data?.data
      setCredentials({
        email:    d?.email    ?? formData.email,
        password: d?.temporaryPassword ?? '',
        name:     d?.name     ?? formData.name,
      })
      setFormData({ name: '', email: '', phone: '' })
      setShowForm(false)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create dispatcher')
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this dispatcher?')) return
    try {
      await deactivateDispatcher.mutateAsync(id)
    } catch {
      // silently handled by hook toast
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (r: Dispatcher) => <span className="text-white text-sm font-medium">{r.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (r: Dispatcher) => <span className="text-zinc-400 text-sm">{r.email}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Dispatcher) => <StatusBadge status={r.status} />,
    },
    {
      key: 'totalLoadsCreated',
      header: 'Total Loads',
      render: (r: Dispatcher) => <span className="text-zinc-300 text-sm">{r.totalLoadsCreated}</span>,
    },
    {
      key: 'totalLoadsCompleted',
      header: 'Completed',
      render: (r: Dispatcher) => <span className="text-zinc-300 text-sm">{r.totalLoadsCompleted}</span>,
    },
    {
      key: 'completionRate',
      header: 'Completion %',
      render: (r: Dispatcher) => (
        <span className="text-zinc-300 text-sm">{(r.completionRate * 100).toFixed(1)}%</span>
      ),
    },
    {
      key: 'overallRating',
      header: 'Rating',
      render: (r: Dispatcher) => (
        <span className="text-zinc-300 text-sm">
          {r.overallRating != null ? r.overallRating.toFixed(1) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r: Dispatcher) =>
        r.status !== 'INACTIVE' ? (
          <button
            onClick={(e) => { e.stopPropagation(); handleDeactivate(r.id) }}
            disabled={deactivateDispatcher.isPending}
            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm"
          >
            Deactivate
          </button>
        ) : null,
    },
  ]

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Dispatchers"
        description="Manage your agency's dispatch team"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {showForm ? 'Cancel' : 'Add Dispatcher'}
          </button>
        }
      />

      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-3">New Dispatcher</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-400 text-xs mb-1">Name *</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                placeholder="Full name"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs mb-1">Email *</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                placeholder="email@example.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs mb-1">Phone</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData((d) => ({ ...d, phone: e.target.value }))}
                placeholder="+1 555 000 0000"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
            {formError && <p className="sm:col-span-3 text-red-400 text-xs">{formError}</p>}
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={createDispatcher.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {createDispatcher.isPending ? 'Creating…' : 'Create Dispatcher'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credentials modal shown after creation */}
      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white font-semibold">Dispatcher Created</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Share these login credentials with <strong className="text-white">{credentials.name}</strong>. They should change their password after first login.
            </p>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 space-y-3 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Email</span>
                <span className="text-white text-sm font-medium">{credentials.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Temporary Password</span>
                <span className="text-white text-sm font-mono font-bold tracking-wider">{credentials.password}</span>
              </div>
            </div>
            <p className="text-amber-400/80 text-xs mb-4">
              ⚠ This password will not be shown again. Copy it before closing.
            </p>
            <button
              onClick={() => setCredentials(null)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              Done — I've copied the credentials
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : !data?.data?.length ? (
        <EmptyState title="No dispatchers yet. Add one above." />
      ) : (
        <>
          <DataTable columns={columns} data={data.data} keyExtractor={(r) => r.id} />
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
