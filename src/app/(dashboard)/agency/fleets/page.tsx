'use client'

import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useFleets } from '@/lib/hooks/useFleets'
import api from '@/lib/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmtDate } from '@/lib/utils'
import { Fleet } from '@/types'

type ReasonState = {
  action: 'reject' | 'suspend'
  fleetId: string
  reason: string
} | null

export default function AgencyFleetsPage() {
  const [page, setPage] = useState(1)
  const [reasonState, setReasonState] = useState<ReasonState>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useFleets({ page, perPage: 20 })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['fleets'] })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/fleets/${id}/approve`),
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/fleets/${id}/reject`, { reason }),
    onSuccess: () => { invalidate(); setReasonState(null) },
  })

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/fleets/${id}/suspend`, { reason }),
    onSuccess: () => { invalidate(); setReasonState(null) },
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/fleets/${id}/reactivate`),
    onSuccess: invalidate,
  })

  function handleApprove(id: string) {
    approveMutation.mutate(id)
  }

  function handleReactivate(id: string) {
    reactivateMutation.mutate(id)
  }

  function handleReasonSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reasonState) return
    if (reasonState.action === 'reject') {
      rejectMutation.mutate({ id: reasonState.fleetId, reason: reasonState.reason })
    } else {
      suspendMutation.mutate({ id: reasonState.fleetId, reason: reasonState.reason })
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (r: Fleet) => (
        <span className="text-white text-sm font-medium">{r.name}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (r: Fleet) => (
        <span className="text-zinc-400 text-sm">{r.email}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (r: Fleet) => (
        <span className="text-zinc-400 text-sm">{r.phone ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Fleet) => <StatusBadge status={r.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (r: Fleet) => (
        <span className="text-zinc-400 text-sm">{fmtDate(r.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: Fleet) => (
        <div className="flex items-center gap-2">
          {r.status === 'PENDING' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleApprove(r.id) }}
                disabled={approveMutation.isPending}
                className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setReasonState({ action: 'reject', fleetId: r.id, reason: '' })
                }}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm"
              >
                Reject
              </button>
            </>
          )}
          {r.status === 'ACTIVE' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setReasonState({ action: 'suspend', fleetId: r.id, reason: '' })
              }}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm"
            >
              Suspend
            </button>
          )}
          {r.status === 'SUSPENDED' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleReactivate(r.id) }}
              disabled={reactivateMutation.isPending}
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
    <div className="p-6 space-y-5">
      <PageHeader title="Fleets" description="Manage fleet partnerships" />

      {isLoading ? (
        <LoadingState />
      ) : !data?.data?.length ? (
        <EmptyState title="No fleets registered yet." />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data.data}
            keyExtractor={(r) => r.id}
          />
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}

      {reasonState && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 max-w-lg">
          <h2 className="text-white font-medium text-sm mb-3">
            {reasonState.action === 'reject' ? 'Reject Fleet' : 'Suspend Fleet'}
          </h2>
          <form onSubmit={handleReasonSubmit} className="space-y-3">
            <div>
              <label className="block text-zinc-400 text-xs mb-1">
                Reason *
              </label>
              <textarea
                required
                rows={3}
                value={reasonState.reason}
                onChange={(e) =>
                  setReasonState((s) => s ? { ...s, reason: e.target.value } : s)
                }
                placeholder={
                  reasonState.action === 'reject'
                    ? 'Why is this fleet being rejected?'
                    : 'Why is this fleet being suspended?'
                }
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 resize-none"
              />
            </div>
            {(rejectMutation.error || suspendMutation.error) && (
              <p className="text-red-400 text-xs">
                {(rejectMutation.error as Error)?.message ||
                  (suspendMutation.error as Error)?.message ||
                  'An error occurred'}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={rejectMutation.isPending || suspendMutation.isPending}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {rejectMutation.isPending || suspendMutation.isPending
                  ? 'Submitting…'
                  : reasonState.action === 'reject'
                  ? 'Confirm Reject'
                  : 'Confirm Suspend'}
              </button>
              <button
                type="button"
                onClick={() => setReasonState(null)}
                className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
