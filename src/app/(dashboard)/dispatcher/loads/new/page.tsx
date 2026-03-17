'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCreateLoad } from '@/lib/hooks/useLoads'
import { PageHeader } from '@/components/shared/PageHeader'

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder:text-zinc-600 transition-colors'

const labelClass = 'block text-zinc-400 text-sm mb-1'

export default function NewLoadPage() {
  const router = useRouter()
  const createLoad = useCreateLoad()

  const [form, setForm] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    deliveryDate: '',
    loadRate: '',
    notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createLoad.mutate(
      {
        pickupLocation:  form.pickupLocation,
        dropoffLocation: form.dropoffLocation,
        pickupDate:      new Date(form.pickupDate).toISOString(),
        deliveryDate:    new Date(form.deliveryDate).toISOString(),
        loadRate:        parseFloat(form.loadRate),
        ...(form.notes ? { notes: form.notes } : {}),
      },
      {
        onSuccess: () => {
          router.push('/dispatcher/loads')
        },
      }
    )
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Create New Load"
        description="Fill in the details to create a new dispatch load"
        action={
          <Link
            href="/dispatcher/loads"
            className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            ← Back to Loads
          </Link>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass} htmlFor="pickupLocation">
                Pickup Location <span className="text-orange-500">*</span>
              </label>
              <input
                id="pickupLocation"
                name="pickupLocation"
                type="text"
                required
                placeholder="e.g. Chicago, IL"
                value={form.pickupLocation}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="dropoffLocation">
                Dropoff Location <span className="text-orange-500">*</span>
              </label>
              <input
                id="dropoffLocation"
                name="dropoffLocation"
                type="text"
                required
                placeholder="e.g. Dallas, TX"
                value={form.dropoffLocation}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="pickupDate">
                Pickup Date <span className="text-orange-500">*</span>
              </label>
              <input
                id="pickupDate"
                name="pickupDate"
                type="date"
                required
                value={form.pickupDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="deliveryDate">
                Delivery Date <span className="text-orange-500">*</span>
              </label>
              <input
                id="deliveryDate"
                name="deliveryDate"
                type="date"
                required
                value={form.deliveryDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="loadRate">
                Load Rate (USD) <span className="text-orange-500">*</span>
              </label>
              <input
                id="loadRate"
                name="loadRate"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="e.g. 3500.00"
                value={form.loadRate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="notes">
                Notes{' '}
                <span className="text-zinc-600 text-xs">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Any additional instructions or notes..."
                value={form.notes}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.06]">
            <button
              type="submit"
              disabled={createLoad.isPending}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {createLoad.isPending ? 'Creating…' : 'Create Load'}
            </button>
            <Link
              href="/dispatcher/loads"
              className="border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
