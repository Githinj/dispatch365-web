import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Dispatcher, PaginatedResponse } from '@/types'

export function useDispatchers(params: Record<string, string | number | undefined> = {}) {
  return useQuery<PaginatedResponse<Dispatcher>>({
    queryKey: ['dispatchers', params],
    queryFn: async () => {
      const res = await api.get('/dispatchers', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}

export function useDispatcher(id: string) {
  return useQuery<Dispatcher>({
    queryKey: ['dispatchers', id],
    queryFn: async () => {
      const res = await api.get(`/dispatchers/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useCreateDispatcher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/dispatchers', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispatchers'] })
      toast.success('Dispatcher created.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useDeactivateDispatcher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/dispatchers/${id}/deactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispatchers'] })
      toast.success('Dispatcher deactivated.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}
