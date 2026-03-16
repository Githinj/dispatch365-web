import { create } from 'zustand'

export type UserRole = 'SUPER_ADMIN' | 'AGENCY_ADMIN' | 'DISPATCHER' | 'FLEET_ADMIN' | 'DRIVER'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  agencyId?: string
  fleetId?: string
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  setLoading: (v: boolean) => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isLoading: false })
  },
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isLoading: false })
  },
  setLoading: (v) => set({ isLoading: v }),
  loadFromStorage: () => {
    try {
      const token = localStorage.getItem('token')
      const raw = localStorage.getItem('user')
      if (token && raw) {
        set({ user: JSON.parse(raw), token, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },
}))
