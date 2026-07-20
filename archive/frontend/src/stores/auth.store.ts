import { create } from 'zustand'
import type { User } from '@/types/api.types'
import { auth as authApi } from '@/services/api/endpoints'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (payload: { accessToken: string; refreshToken: string; user: User }) => void
  clearAuth: () => void
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  setAuth: (payload) => {
    localStorage.setItem('accessToken', payload.accessToken)
    localStorage.setItem('refreshToken', payload.refreshToken)
    set({
      user: payload.user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // best-effort
    }
    get().clearAuth()
  },

  checkSession: async () => {
    const token = get().accessToken
    if (!token) return
    set({ isLoading: true })
    try {
      const userData = await authApi.me()
      set({ user: userData as unknown as User, isLoading: false, isAuthenticated: true })
    } catch {
      get().clearAuth()
      set({ isLoading: false })
    }
  },

  setUser: (user) => set({ user }),
}))
