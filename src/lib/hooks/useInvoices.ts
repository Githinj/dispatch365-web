import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Invoice, Receipt, PaginatedResponse } from '@/types'

export function useInvoices(params: Record<string, string | number | undefined> = {}) {
  return useQuery<PaginatedResponse<Invoice>>({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const res = await api.get('/invoices', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const res = await api.get(`/invoices/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.post(`/invoices/${id}/record-payment`, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['invoices', id] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Payment recorded.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useRaiseDispute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/invoices/${id}/raise-dispute`, { reason }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['invoices', id] })
      toast.success('Dispute raised.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export function useReceipts(params: Record<string, string | number | undefined> = {}) {
  return useQuery<PaginatedResponse<Receipt>>({
    queryKey: ['receipts', params],
    queryFn: async () => {
      const res = await api.get('/receipts', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}
