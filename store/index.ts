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

export type DietaryPreferences = {
  conditions: string[]
  allergies: string[]
  diet_type: string
}

export const DEFAULT_PREFERENCES: DietaryPreferences = {
  conditions: [],
  allergies: [],
  diet_type: 'none',
}

type DietaryStore = {
  preferences: DietaryPreferences
  setPreferences: (prefs: DietaryPreferences) => void
}

export const useDietaryStore = create<DietaryStore>((set) => ({
  preferences: DEFAULT_PREFERENCES,
  setPreferences: (preferences) => set({ preferences })
}))