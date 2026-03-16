'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { useInvoice, useRaiseDispute } from '@/lib/hooks/useInvoices'
import { fmt, fmtDate, fmtDateTime } from '@/lib/utils'

export default function FleetInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: invoice, isLoading } = useInvoice(id)
  const raiseDispute = useRaiseDispute()

  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeError, setDisputeError] = useState('')
  const [disputeSuccess, setDisputeSuccess] = useState(false)

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault()
    setDisputeError('')
    if (!disputeReason.trim()) {
      setDisputeError('Please provide a reason for the dispute.')
      return
    }
    try {
      await raiseDispute.mutateAsync({ id, reason: disputeReason.trim() })
      setDisputeSuccess(true)
      setShowDisputeForm(false)
      setDisputeReason('')
    } catch {
      setDisputeError('Failed to raise dispute. Please try again.')
    }
  }

  if (isLoading) return <div className="p-6"><LoadingState /></div>
  if (!invoice) return (
    <div className="p-6">
      <p className="text-zinc-500">Invoice not found.</p>
    </div>
  )

  const canDispute = !invoice.isDisputed && invoice.status !== 'PAID'

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link
          href="/fleet/invoices"
          className="text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-1 transition-colors"
        >
          ← Back to Invoices
        </Link>
      </div>

      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        description="Invoice details"
        action={<StatusBadge status={invoice.status} />}
      />

      {disputeSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 text-green-400 text-sm">
          Dispute raised successfully. The agency has been notified.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Invoice details */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Load Info */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white font-medium text-sm mb-3">Load Information</p>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Invoice #</dt>
                <dd className="text-orange-400 font-medium text-sm">{invoice.invoiceNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Load #</dt>
                <dd className="text-zinc-300 text-sm">{invoice.load?.loadNumber ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Status</dt>
                <dd><StatusBadge status={invoice.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Generated</dt>
                <dd className="text-zinc-300 text-sm">{fmtDateTime(invoice.generatedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Due Date</dt>
                <dd className="text-zinc-300 text-sm">{invoice.dueDate ? fmtDate(invoice.dueDate) : '—'}</dd>
              </div>
              {invoice.paymentDate && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500 text-sm">Payment Date</dt>
                  <dd className="text-zinc-300 text-sm">{fmtDate(invoice.paymentDate)}</dd>
                </div>
              )}
              {invoice.paymentMethod && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500 text-sm">Payment Method</dt>
                  <dd className="text-zinc-300 text-sm">{invoice.paymentMethod}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Financials */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white font-medium text-sm mb-3">Financial Breakdown</p>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Load Rate</dt>
                <dd className="text-zinc-300 text-sm font-medium">{fmt(invoice.loadRate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Commission Rate</dt>
                <dd className="text-zinc-300 text-sm">{invoice.commissionPercent}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-sm">Commission Amount</dt>
                <dd className="text-zinc-300 text-sm">{fmt(invoice.commissionAmount)}</dd>
              </div>
              <div className="flex justify-between border-t border-white/[0.06] pt-3">
                <dt className="text-zinc-500 text-sm font-medium">Fleet Earnings</dt>
                <dd className="text-green-400 text-sm font-semibold">{fmt(invoice.fleetEarnings)}</dd>
              </div>
              {invoice.amountPaid != null && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500 text-sm">Amount Paid</dt>
                  <dd className="text-green-400 text-sm font-medium">{fmt(invoice.amountPaid)}</dd>
                </div>
              )}
              {invoice.amountPaid != null && invoice.fleetEarnings > invoice.amountPaid && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500 text-sm">Balance Due</dt>
                  <dd className="text-red-400 text-sm font-medium">{fmt(invoice.fleetEarnings - invoice.amountPaid)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Dispute Info */}
          {invoice.isDisputed && invoice.disputeReason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 font-medium text-sm mb-2">Dispute Filed</p>
              <p className="text-zinc-300 text-sm">{invoice.disputeReason}</p>
            </div>
          )}

          {/* Receipt */}
          {invoice.receipt && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-white font-medium text-sm mb-3">Receipt Details</p>
              <dl className="space-y-3">
                {invoice.receipt.pdfUrl && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 text-sm">Receipt PDF</dt>
                    <dd>
                      <a
                        href={invoice.receipt.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-400 hover:text-orange-300 text-sm underline"
                      >
                        Download Receipt PDF
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white font-medium text-sm mb-3">Actions</p>
            <div className="flex flex-col gap-3">
              {invoice.pdfUrl && (
                <a
                  href={invoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Download Invoice PDF
                </a>
              )}

              {invoice.receipt?.pdfUrl && (
                <a
                  href={invoice.receipt.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Download Receipt PDF
                </a>
              )}

              {canDispute && !showDisputeForm && (
                <button
                  onClick={() => setShowDisputeForm(true)}
                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm"
                >
                  Raise Dispute
                </button>
              )}

              {!invoice.pdfUrl && !invoice.receipt?.pdfUrl && !canDispute && (
                <p className="text-zinc-600 text-sm">No actions available.</p>
              )}
            </div>

            {showDisputeForm && (
              <form onSubmit={handleDispute} className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-white font-medium text-sm mb-2">Raise a Dispute</p>
                <textarea
                  rows={4}
                  placeholder="Describe the reason for disputing this invoice..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 resize-none mb-2"
                />
                {disputeError && (
                  <p className="text-red-400 text-xs mb-2">{disputeError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={raiseDispute.isPending}
                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                  >
                    {raiseDispute.isPending ? 'Submitting...' : 'Submit Dispute'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowDisputeForm(false); setDisputeReason(''); setDisputeError('') }}
                    className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Invoice meta */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white font-medium text-sm mb-3">Summary</p>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-xs">Fleet</dt>
                <dd className="text-zinc-300 text-xs">{invoice.fleet?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500 text-xs">Disputed</dt>
                <dd className={`text-xs font-medium ${invoice.isDisputed ? 'text-red-400' : 'text-zinc-400'}`}>
                  {invoice.isDisputed ? 'Yes' : 'No'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
