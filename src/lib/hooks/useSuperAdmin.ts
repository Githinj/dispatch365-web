import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'

export interface PlatformStats {
  agencies: { total: number; active: number; suspended: number }
  fleets: { total: number }
  dispatchers: { total: number }
  drivers: { total: number }
  vehicles: { total: number }
  loads: { total: number; byStatus: Record<string, number> }
  invoices: { total: number; unpaid: number; overdue: number }
  revenue: { totalGrossLoadRate: number; totalCommission: number; totalFleetEarnings: number }
}

export function usePlatformStats() {
  return useQuery<PlatformStats>({
    queryKey: ['super-admin', 'stats'],
    queryFn: async () => {
      const res = await api.get('/super-admin/stats')
      return res.data.data
    },
  })
}

export function useAuditLogs(params: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const res = await api.get('/super-admin/audit-logs', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const res = await api.get('/super-admin/settings')
      return res.data.data as Array<{ id: string; key: string; value: string; description?: string }>
    },
  })
}

export function useUpdatePlatformSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.patch(`/super-admin/settings/${key}`, { value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-settings'] })
      toast.success('Setting updated.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useFlaggedRatings() {
  return useQuery({
    queryKey: ['flagged-ratings'],
    queryFn: async () => {
      const res = await api.get('/super-admin/flagged-ratings')
      return res.data.data
    },
  })
}

export function useRemoveFlaggedRating() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.delete(`/super-admin/flagged-ratings/${id}`, { data: { reason } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flagged-ratings'] })
      toast.success('Rating removed.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useCreateAgency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/super-admin/agencies', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencies'] })
      toast.success('Agency created.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create agency'),
  })
}
