'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useInvoice, useRecordPayment } from '@/lib/hooks/useInvoices'
import api from '@/lib/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { fmt, fmtDate, fmtDateTime } from '@/lib/utils'
import Link from 'next/link'
import { PaymentMethod } from '@/types'

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Cash', value: 'CASH' },
  { label: 'Other', value: 'OTHER' },
]

export default function AgencyInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: invoice, isLoading } = useInvoice(id)
  const recordPayment = useRecordPayment()

  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '',
    paymentMethod: 'BANK_TRANSFER' as PaymentMethod,
    paymentReference: '',
    paymentDate: '',
  })
  const [paymentError, setPaymentError] = useState('')

  const [resolution, setResolution] = useState('')
  const [disputeError, setDisputeError] = useState('')

  const resolveDisputeMutation = useMutation({
    mutationFn: (res: string) => api.post(`/invoices/${id}/resolve-dispute`, { resolution: res }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', id] })
      setResolution('')
    },
    onError: (err: unknown) => {
      setDisputeError(err instanceof Error ? err.message : 'Failed to resolve dispute')
    },
  })

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault()
    setPaymentError('')
    try {
      await recordPayment.mutateAsync({
        id,
        data: {
          amountPaid: parseFloat(paymentForm.amountPaid),
          paymentMethod: paymentForm.paymentMethod,
          paymentReference: paymentForm.paymentReference || undefined,
          paymentDate: paymentForm.paymentDate,
        },
      })
      setPaymentForm({
        amountPaid: '',
        paymentMethod: 'BANK_TRANSFER',
        paymentReference: '',
        paymentDate: '',
      })
    } catch (err: unknown) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to record payment')
    }
  }

  function handleResolveDispute(e: React.FormEvent) {
    e.preventDefault()
    setDisputeError('')
    resolveDisputeMutation.mutate(resolution)
  }

  if (isLoading) return <LoadingState />
  if (!invoice) return (
    <div className="p-6">
      <p className="text-zinc-500 text-sm">Invoice not found.</p>
    </div>
  )

  const canRecordPayment =
    invoice.status === 'UNPAID' ||
    invoice.status === 'PARTIALLY_PAID' ||
    invoice.status === 'OVERDUE'

  const inputClass =
    'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50'
  const selectClass =
    'w-full bg-[#0a0a0f] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50'

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        description={
          <Link href="/agency/invoices" className="text-zinc-500 hover:text-zinc-300 text-sm">
            ← Back to Invoices
          </Link>
        }
        action={<StatusBadge status={invoice.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: invoice details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Load Info */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-medium text-sm mb-3">Load Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Load Number</p>
                <p className="text-orange-400 font-mono text-sm">
                  {invoice.load?.loadNumber ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Route</p>
                <p className="text-zinc-200 text-sm">
                  {invoice.load
                    ? `${(invoice.load as { pickupLocation?: string }).pickupLocation} → ${(invoice.load as { dropoffLocation?: string }).dropoffLocation}`
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Fleet */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-medium text-sm mb-3">Fleet</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Fleet Name</p>
                <p className="text-zinc-200 text-sm">{invoice.fleet?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Fleet ID</p>
                <p className="text-zinc-200 text-sm font-mono text-xs">{invoice.fleetId}</p>
              </div>
            </div>
          </div>

          {/* Amounts */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-medium text-sm mb-3">Financials</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Load Rate</p>
                <p className="text-white text-sm font-medium">{fmt(invoice.loadRate)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Commission %</p>
                <p className="text-zinc-200 text-sm">{invoice.commissionPercent}%</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Commission</p>
                <p className="text-orange-400 text-sm font-medium">{fmt(invoice.commissionAmount)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Fleet Earnings</p>
                <p className="text-zinc-200 text-sm font-medium">{fmt(invoice.fleetEarnings)}</p>
              </div>
              {invoice.amountPaid != null && (
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Amount Paid</p>
                  <p className="text-green-400 text-sm font-medium">{fmt(invoice.amountPaid)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-medium text-sm mb-3">Dates</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Generated</p>
                <p className="text-zinc-200 text-sm">{fmtDateTime(invoice.generatedAt)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Due Date</p>
                <p className="text-zinc-200 text-sm">{fmtDate(invoice.dueDate)}</p>
              </div>
              {invoice.paymentDate && (
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Paid On</p>
                  <p className="text-green-400 text-sm">{fmtDate(invoice.paymentDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dispute info */}
          {invoice.isDisputed && invoice.disputeReason && (
            <div className="bg-red-500/[0.05] border border-red-500/20 rounded-xl p-5">
              <h2 className="text-red-400 font-medium text-sm mb-2">Dispute Reason</h2>
              <p className="text-zinc-300 text-sm">{invoice.disputeReason}</p>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-medium text-sm mb-3">Actions</h2>

            <div className="space-y-3">
              {invoice.pdfUrl && (
                <a
                  href={invoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm"
                >
                  Download Invoice PDF
                </a>
              )}
              {invoice.receipt?.pdfUrl && (
                <a
                  href={invoice.receipt.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm"
                >
                  Download Receipt PDF
                </a>
              )}
            </div>

            {canRecordPayment && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <h3 className="text-white font-medium text-sm mb-3">Record Payment</h3>
                <form onSubmit={handleRecordPayment} className="space-y-3">
                  <div>
                    <label className="block text-zinc-400 text-xs mb-1">Amount Paid *</label>
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={paymentForm.amountPaid}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, amountPaid: e.target.value }))
                      }
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs mb-1">Payment Method *</label>
                    <select
                      required
                      value={paymentForm.paymentMethod}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          paymentMethod: e.target.value as PaymentMethod,
                        }))
                      }
                      className={selectClass}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs mb-1">Reference</label>
                    <input
                      value={paymentForm.paymentReference}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, paymentReference: e.target.value }))
                      }
                      placeholder="Optional reference"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs mb-1">Payment Date *</label>
                    <input
                      required
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, paymentDate: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  {paymentError && (
                    <p className="text-red-400 text-xs">{paymentError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={recordPayment.isPending}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {recordPayment.isPending ? 'Recording…' : 'Record Payment'}
                  </button>
                </form>
              </div>
            )}

            {invoice.isDisputed && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <h3 className="text-white font-medium text-sm mb-3">Resolve Dispute</h3>
                <form onSubmit={handleResolveDispute} className="space-y-3">
                  <div>
                    <label className="block text-zinc-400 text-xs mb-1">Resolution *</label>
                    <textarea
                      required
                      rows={4}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Describe how the dispute was resolved…"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 resize-none"
                    />
                  </div>
                  {disputeError && (
                    <p className="text-red-400 text-xs">{disputeError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={resolveDisputeMutation.isPending}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {resolveDisputeMutation.isPending ? 'Resolving…' : 'Resolve Dispute'}
                  </button>
                </form>
              </div>
            )}

            {!canRecordPayment && !invoice.isDisputed && (
              <p className="mt-3 text-zinc-600 text-xs">No actions available for this invoice.</p>
            )}
          </div>

          {invoice.receipt && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-white font-medium text-sm mb-3">Receipt</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Receipt #</span>
                  <span className="text-zinc-300 text-xs font-mono">
                    {invoice.receipt.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Amount</span>
                  <span className="text-green-400 text-xs">
                    {fmt(invoice.receipt.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Method</span>
                  <span className="text-zinc-300 text-xs">
                    {invoice.receipt.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs">Date</span>
                  <span className="text-zinc-300 text-xs">
                    {fmtDate(invoice.receipt.paymentDate)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
