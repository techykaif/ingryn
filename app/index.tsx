import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '@/hooks/useOnboarding'

export default function Index() {
  const router = useRouter()
  const { showOnboarding, loading } = useOnboarding()

  useEffect(() => {
    if (loading) return
    if (showOnboarding) {
      router.replace('/(auth)/onboarding' as any)
    } else {
      router.replace('/(auth)/welcome')
    }
  }, [loading, showOnboarding])

  return (
    <View style={{ flex: 1, backgroundColor: '#080808', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#00E5A0" size="large" />
    </View>
  )
}