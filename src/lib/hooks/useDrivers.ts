import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Driver, PaginatedResponse } from '@/types'

export function useDrivers(params: Record<string, string | number | undefined> = {}) {
  return useQuery<PaginatedResponse<Driver>>({
    queryKey: ['drivers', params],
    queryFn: async () => {
      const res = await api.get('/drivers', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}

export function useDriver(id: string) {
  return useQuery<Driver>({
    queryKey: ['drivers', id],
    queryFn: async () => {
      const res = await api.get(`/drivers/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useInviteDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/drivers/invite', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['drivers'] })
      toast.success('Driver invitation sent.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to invite driver'),
  })
}

export function useDeactivateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/drivers/${id}/deactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['drivers'] })
      toast.success('Driver deactivated.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useReactivateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/drivers/${id}/reactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['drivers'] })
      toast.success('Driver reactivated.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}
