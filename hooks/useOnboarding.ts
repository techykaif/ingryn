import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_KEY = 'ingryn_onboarding_complete'

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkOnboarding()
  }, [])

  async function checkOnboarding() {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY)
      setShowOnboarding(value === null)
    } catch {
      setShowOnboarding(false)
    } finally {
      setLoading(false)
    }
  }

  async function completeOnboarding() {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
      setShowOnboarding(false)
    } catch {}
  }

  return { showOnboarding, loading, completeOnboarding }
}