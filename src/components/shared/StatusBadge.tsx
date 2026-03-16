import { cn } from '@/lib/utils'

const COLORS: Record<string, string> = {
  // Load
  DRAFT:                         'bg-zinc-500/10 text-zinc-400',
  ASSIGNED:                      'bg-blue-500/10 text-blue-400',
  IN_TRANSIT:                    'bg-yellow-500/10 text-yellow-400',
  PENDING_DELIVERY_CONFIRMATION: 'bg-purple-500/10 text-purple-400',
  DELIVERED:                     'bg-teal-500/10 text-teal-400',
  COMPLETED:                     'bg-green-500/10 text-green-400',
  CANCELLED:                     'bg-red-500/10 text-red-400',
  // Invoice
  UNPAID:         'bg-yellow-500/10 text-yellow-400',
  PARTIALLY_PAID: 'bg-blue-500/10 text-blue-400',
  PAID:           'bg-green-500/10 text-green-400',
  OVERDUE:        'bg-red-500/10 text-red-400',
  DISPUTED:       'bg-purple-500/10 text-purple-400',
  // Vehicle
  AVAILABLE:         'bg-green-500/10 text-green-400',
  ON_LOAD:           'bg-blue-500/10 text-blue-400',
  UNDER_MAINTENANCE: 'bg-yellow-500/10 text-yellow-400',
  INACTIVE:          'bg-zinc-500/10 text-zinc-400',
  // Driver / Dispatcher / Fleet / Agency
  ACTIVE:               'bg-green-500/10 text-green-400',
  PENDING:              'bg-yellow-500/10 text-yellow-400',
  INVITED:              'bg-blue-500/10 text-blue-400',
  SUSPENDED:            'bg-red-500/10 text-red-400',
  REJECTED:             'bg-red-500/10 text-red-400',
  SUSPENDED_TRANSFER:   'bg-orange-500/10 text-orange-400',
  SUSPENDED_RESTORATION:'bg-orange-500/10 text-orange-400',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = COLORS[status] ?? 'bg-zinc-500/10 text-zinc-400'
  const label = status.replace(/_/g, ' ')
  return (
    <span className={cn('inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full', color, className)}>
      {label}
    </span>
  )
}
