'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import api from '@/lib/api'

const NAV: Record<string, { href: string; label: string; icon: string }[]> = {
  SUPER_ADMIN: [
    { href: '/super-admin', label: 'Dashboard', icon: '▦' },
    { href: '/super-admin/agencies', label: 'Agencies', icon: '🏢' },
    { href: '/super-admin/fleets', label: 'Fleets', icon: '🚛' },
    { href: '/super-admin/dispatchers', label: 'Dispatchers', icon: '👤' },
    { href: '/super-admin/drivers', label: 'Drivers', icon: '🧑' },
    { href: '/super-admin/loads', label: 'Loads', icon: '📦' },
    { href: '/super-admin/financials', label: 'Financials', icon: '💰' },
    { href: '/super-admin/audit-logs', label: 'Audit Logs', icon: '📋' },
    { href: '/super-admin/settings', label: 'Settings', icon: '⚙️' },
  ],
  AGENCY_ADMIN: [
    { href: '/agency', label: 'Dashboard', icon: '▦' },
    { href: '/agency/loads', label: 'Loads', icon: '📦' },
    { href: '/agency/dispatchers', label: 'Dispatchers', icon: '👤' },
    { href: '/agency/fleets', label: 'Fleets', icon: '🚛' },
    { href: '/agency/invoices', label: 'Invoices', icon: '🧾' },
    { href: '/agency/settings', label: 'Settings', icon: '⚙️' },
  ],
  DISPATCHER: [
    { href: '/dispatcher', label: 'Dashboard', icon: '▦' },
    { href: '/dispatcher/loads', label: 'My Loads', icon: '📦' },
    { href: '/dispatcher/loads/new', label: 'New Load', icon: '➕' },
    { href: '/dispatcher/performance', label: 'Performance', icon: '📈' },
    { href: '/dispatcher/account', label: 'Account', icon: '👤' },
  ],
  FLEET_ADMIN: [
    { href: '/fleet', label: 'Dashboard', icon: '▦' },
    { href: '/fleet/loads', label: 'Loads', icon: '📦' },
    { href: '/fleet/drivers', label: 'Drivers', icon: '🧑' },
    { href: '/fleet/vehicles', label: 'Vehicles', icon: '🚛' },
    { href: '/fleet/invoices', label: 'Invoices', icon: '🧾' },
    { href: '/fleet/settings', label: 'Settings', icon: '⚙️' },
  ],
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, token, setAuth, clearAuth, loadFromStorage, isLoading } = useAuthStore()

  useEffect(() => { loadFromStorage() }, [])

  useEffect(() => {
    if (isLoading) return
    if (!token) { router.replace('/login'); return }
    api.get('/auth/me')
      .then((res) => setAuth(res.data.data, token))
      .catch(() => { clearAuth(); router.replace('/login') })
  }, [isLoading, token])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    clearAuth()
    router.replace('/login')
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const navItems = NAV[user.role] || []

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <aside className="w-60 border-r border-white/[0.06] flex flex-col">
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">D</div>
            <span className="text-white font-semibold text-sm">Dispatch 365</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href.split('/').length > 2 && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-orange-500/10 text-orange-400 font-medium' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-zinc-500 text-xs truncate">{user.email}</p>
            <span className="mt-1 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">
              {user.role.replace('_', ' ')}
            </span>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors">
            <span>↩</span> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {user.role === 'DISPATCHER' && (user as any).mustChangePassword && (
          <div className="flex items-center gap-3 px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
            <span className="text-amber-400">⚠</span>
            <p className="text-amber-300 text-sm">
              You are using a temporary password.{' '}
              <a href="/dispatcher/account" className="underline font-medium hover:text-amber-200">
                Change it now
              </a>{' '}
              to secure your account.
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
