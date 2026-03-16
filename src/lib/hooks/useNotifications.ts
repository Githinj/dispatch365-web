import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Notification, PaginatedResponse } from '@/types'

export function useNotifications(params: { page?: number; isRead?: boolean } = {}) {
  return useQuery<PaginatedResponse<Notification>>({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const res = await api.get('/notifications', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}

export function useUnreadCount() {
  return useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await api.get('/notifications/unread-count')
      return res.data.data.count
    },
    refetchInterval: 30_000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
