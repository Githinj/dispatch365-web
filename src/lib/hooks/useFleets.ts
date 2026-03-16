import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Fleet, PaginatedResponse } from '@/types'

export function useFleets(params: Record<string, string | number | undefined> = {}) {
  return useQuery<PaginatedResponse<Fleet>>({
    queryKey: ['fleets', params],
    queryFn: async () => {
      const res = await api.get('/fleets', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}

export function useFleet(id: string) {
  return useQuery<Fleet>({
    queryKey: ['fleets', id],
    queryFn: async () => {
      const res = await api.get(`/fleets/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}
