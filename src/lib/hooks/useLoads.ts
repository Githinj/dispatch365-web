import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Load, PaginatedResponse } from '@/types'

export function useLoads(params: Record<string, string | number | undefined> = {}) {
  return useQuery<PaginatedResponse<Load>>({
    queryKey: ['loads', params],
    queryFn: async () => {
      const res = await api.get('/loads', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}

export function useLoad(id: string) {
  return useQuery<Load>({
    queryKey: ['loads', id],
    queryFn: async () => {
      const res = await api.get(`/loads/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useCreateLoad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/loads', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loads'] })
      toast.success('Load created.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create load'),
  })
}

export function useAssignLoad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.post(`/loads/${id}/assign`, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['loads', id] })
      qc.invalidateQueries({ queryKey: ['loads'] })
      toast.success('Load assigned.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Assignment failed'),
  })
}

export function useStartTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/loads/${id}/start-trip`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['loads', id] })
      toast.success('Trip started.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to start trip'),
  })
}

export function useAcceptDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/loads/${id}/accept-delivery`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['loads', id] })
      qc.invalidateQueries({ queryKey: ['loads'] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Delivery accepted. Load completed.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useRejectDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/loads/${id}/reject-delivery`, { reason }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['loads', id] })
      toast.success('Delivery rejected.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useCancelLoad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.post(`/loads/${id}/cancel`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loads'] })
      toast.success('Load cancelled.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to cancel'),
  })
}
