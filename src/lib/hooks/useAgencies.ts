import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Agency, PaginatedResponse } from '@/types'

export function useAgencies(params: Record<string, string | number | undefined> = {}) {
  return useQuery<PaginatedResponse<Agency>>({
    queryKey: ['agencies', params],
    queryFn: async () => {
      const res = await api.get('/agencies', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}

export function useAgency(id: string) {
  return useQuery<Agency>({
    queryKey: ['agencies', id],
    queryFn: async () => {
      const res = await api.get(`/agencies/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useSuspendAgency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/agencies/${id}/suspend`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencies'] })
      toast.success('Agency suspended.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useReactivateAgency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/agencies/${id}/reactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencies'] })
      toast.success('Agency reactivated.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}
