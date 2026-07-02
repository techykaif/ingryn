import AsyncStorage from '@react-native-async-storage/async-storage'

export const ONBOARDING_KEY = 'ingryn_onboarding_complete'

export async function getOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY)
    return value !== null
  } catch {
    return false
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
  } catch {}
}
