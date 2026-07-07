import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

type AuthStore = {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

type ScanProgressStore = {
  activeScans: Record<string, boolean>
  setActiveScan: (scanId: string, isActive: boolean) => void
}

export const useScanProgressStore = create<ScanProgressStore>((set) => ({
  activeScans: {},
  setActiveScan: (scanId, isActive) => set((state) => ({
    activeScans: { ...state.activeScans, [scanId]: isActive }
  }))
}))