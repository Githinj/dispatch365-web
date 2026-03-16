'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAgencies, useSuspendAgency, useReactivateAgency } from '@/lib/hooks/useAgencies'
import { useCreateAgency } from '@/lib/hooks/useSuperAdmin'
import { fmtDate } from '@/lib/utils'
import type { Agency, SubscriptionPlan } from '@/types'

const PLAN_STYLES: Record<SubscriptionPlan, string> = {
  BASIC: 'bg-zinc-500/10 text-zinc-400',
  PRO: 'bg-blue-500/10 text-blue-400',
  ENTERPRISE: 'bg-orange-500/10 text-orange-400',
}

const inputClass = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-500/50'
const selectClass = inputClass + ' bg-[#0a0a0f]'

const blank = {
  name: '', ownerName: '', contactEmail: '', contactPhone: '', address: '',
  adminName: '', adminEmail: '', adminPassword: '', adminPhone: '',
  plan: 'BASIC', commissionPercent: '8', paymentTermsDays: '30',
}

export default function AgenciesPage() {
  const [page, setPage] = useState(1)
  const [suspendState, setSuspendState] = useState<{ agencyId: string; reason: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank)

  const { data, isLoading } = useAgencies({ page, perPage: 20 })
  const suspend = useSuspendAgency()
  const reactivate = useReactivateAgency()
  const createAgency = useCreateAgency()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createAgency.mutate(
      {
        ...form,
        commissionPercent: parseFloat(form.commissionPercent),
        paymentTermsDays: parseInt(form.paymentTermsDays),
      },
      {
        onSuccess: () => {
          setShowForm(false)
          setForm(blank)
        },
      }
    )
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row: Agency) => <span className="text-white font-medium">{row.name}</span>,
    },
    {
      key: 'contactEmail',
      header: 'Email',
      render: (row: Agency) => <span className="text-zinc-400">{row.contactEmail}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Agency) => <StatusBadge status={row.status} />,
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (row: Agency) => (
        <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${PLAN_STYLES[row.plan]}`}>
          {row.plan}
        </span>
      ),
    },
    {
      key: 'commissionPercent',
      header: 'Commission',
      render: (row: Agency) => <span className="text-zinc-400">{row.commissionPercent}%</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row: Agency) => <span className="text-zinc-500">{fmtDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Agency) => {
        if (suspendState?.agencyId === row.id) {
          return (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Reason for suspension"
                value={suspendState.reason}
                onChange={(e) => setSuspendState({ agencyId: row.id, reason: e.target.value })}
                className="w-44 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500/50"
              />
              <button
                onClick={() => {
                  if (!suspendState.reason.trim()) return
                  suspend.mutate({ id: row.id, reason: suspendState.reason }, { onSuccess: () => setSuspendState(null) })
                }}
                disabled={suspend.isPending}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
              >
                Confirm
              </button>
              <button onClick={() => setSuspendState(null)} className="border border-white/[0.08] text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          )
        }
        if (row.status === 'ACTIVE') {
          return (
            <button
              onClick={() => setSuspendState({ agencyId: row.id, reason: '' })}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm"
            >
              Suspend
            </button>
          )
        }
        return (
          <button
            onClick={() => reactivate.mutate(row.id)}
            disabled={reactivate.isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Reactivate
          </button>
        )
      },
    },
  ]

  if (isLoading) return <LoadingState />

  return (
    <div className="p-6">
      <PageHeader
        title="Agencies"
        description="All agencies registered on the platform."
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {showForm ? 'Cancel' : '+ New Agency'}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 mb-6">
          <p className="text-white font-medium text-sm mb-5">Create New Agency</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Agency Details</p>
            </div>
            {[
              { label: 'Agency Name', key: 'name', required: true },
              { label: 'Owner Name', key: 'ownerName', required: true },
              { label: 'Contact Email', key: 'contactEmail', type: 'email', required: true },
              { label: 'Contact Phone', key: 'contactPhone', required: true },
              { label: 'Address', key: 'address', required: true },
            ].map(({ label, key, type, required }) => (
              <div key={key}>
                <label className="block text-zinc-400 text-xs mb-1.5">{label}{required && ' *'}</label>
                <input type={type ?? 'text'} value={(form as any)[key]} onChange={set(key)} required={required} className={inputClass} />
              </div>
            ))}
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Plan</label>
              <select value={form.plan} onChange={set('plan')} className={selectClass}>
                <option value="BASIC">Basic</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Commission %</label>
              <input type="number" min="0" max="100" step="0.1" value={form.commissionPercent} onChange={set('commissionPercent')} className={inputClass} />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Payment Terms (days)</label>
              <input type="number" min="1" max="365" value={form.paymentTermsDays} onChange={set('paymentTermsDays')} className={inputClass} />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-white/[0.06]">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3 mt-2">Admin Account</p>
            </div>
            {[
              { label: 'Admin Full Name', key: 'adminName', required: true },
              { label: 'Admin Email', key: 'adminEmail', type: 'email', required: true },
              { label: 'Admin Phone', key: 'adminPhone' },
              { label: 'Password', key: 'adminPassword', type: 'password', required: true },
            ].map(({ label, key, type, required }) => (
              <div key={key}>
                <label className="block text-zinc-400 text-xs mb-1.5">{label}{required && ' *'}</label>
                <input type={type ?? 'text'} value={(form as any)[key]} onChange={set(key)} required={required} className={inputClass} />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createAgency.isPending}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium"
            >
              {createAgency.isPending ? 'Creating...' : 'Create Agency'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(blank) }} className="border border-white/[0.08] text-zinc-400 hover:text-white px-4 py-2 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        {!data?.data.length ? (
          <EmptyState title="No agencies found." />
        ) : (
          <>
            <DataTable columns={columns} data={data.data} keyExtractor={(r) => r.id} />
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
