import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Vehicle, PaginatedResponse } from '@/types'

export function useVehicles(params: Record<string, string | number | undefined> = {}) {
  return useQuery<PaginatedResponse<Vehicle>>({
    queryKey: ['vehicles', params],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}

export function useVehicle(id: string) {
  return useQuery<Vehicle>({
    queryKey: ['vehicles', id],
    queryFn: async () => {
      const res = await api.get(`/vehicles/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/vehicles', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Vehicle added.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useUpdateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.patch(`/vehicles/${id}`, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['vehicles', id] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Vehicle updated.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useStartMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: Record<string, unknown> }) =>
      api.post(`/vehicles/${id}/maintenance/start`, data ?? {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Vehicle placed under maintenance.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useCompleteMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.post(`/vehicles/${id}/maintenance/complete`, { notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Maintenance complete. Vehicle available.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}
