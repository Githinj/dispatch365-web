'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuditLogs } from '@/lib/hooks/useSuperAdmin'
import { fmtDateTime } from '@/lib/utils'

interface AuditLog {
  id: string
  entityType: string
  entityId: string
  action: string
  actorId: string
  actorRole: string
  agencyId?: string
  details?: Record<string, unknown>
  createdAt: string
}

const ACTOR_ROLES = [
  { label: 'All Roles', value: '' },
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
  { label: 'Agency Admin', value: 'AGENCY_ADMIN' },
  { label: 'Dispatcher', value: 'DISPATCHER' },
  { label: 'Fleet Admin', value: 'FLEET_ADMIN' },
  { label: 'Driver', value: 'DRIVER' },
]

export default function SuperAdminAuditLogsPage() {
  const [page, setPage] = useState(1)
  const [entityType, setEntityType] = useState('')
  const [actorRole, setActorRole] = useState('')
  const [agencyId, setAgencyId] = useState('')

  const { data, isLoading } = useAuditLogs({
    page,
    perPage: 20,
    entityType: entityType || undefined,
    actorRole: actorRole || undefined,
    agencyId: agencyId || undefined,
  })

  const logs: AuditLog[] = data?.data ?? []
  const meta = data?.meta

  const columns = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (row: AuditLog) => (
        <span className="text-zinc-500 text-xs">{fmtDateTime(row.createdAt)}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row: AuditLog) => (
        <span className="text-white font-semibold text-sm">{row.action}</span>
      ),
    },
    {
      key: 'entityType',
      header: 'Entity Type',
      render: (row: AuditLog) => (
        <span className="text-zinc-400">{row.entityType}</span>
      ),
    },
    {
      key: 'entityId',
      header: 'Entity ID',
      render: (row: AuditLog) => (
        <span className="text-zinc-500 font-mono text-xs">{row.entityId}</span>
      ),
    },
    {
      key: 'actorRole',
      header: 'Actor Role',
      render: (row: AuditLog) => <StatusBadge status={row.actorRole} />,
    },
    {
      key: 'agencyId',
      header: 'Agency ID',
      render: (row: AuditLog) => (
        <span className="text-zinc-500 font-mono text-xs">{row.agencyId ?? '—'}</span>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader title="Audit Logs" description="Track all significant actions across the platform." />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Filter by entity type..."
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1) }}
          className="w-52 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
        />
        <select
          value={actorRole}
          onChange={(e) => { setActorRole(e.target.value); setPage(1) }}
          className="bg-[#0a0a0f] bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
        >
          {ACTOR_ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Filter by agency ID..."
          value={agencyId}
          onChange={(e) => { setAgencyId(e.target.value); setPage(1) }}
          className="w-52 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          {!logs.length ? (
            <EmptyState title="No audit logs found." />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={logs}
                keyExtractor={(r) => r.id}
              />
              {meta && <Pagination meta={meta} onPageChange={setPage} />}
            </>
          )}
        </div>
      )}
    </div>
  )
}
