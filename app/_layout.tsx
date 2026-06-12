import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { View, ActivityIndicator } from 'react-native'
import 'react-native-url-polyfill/auto'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/index'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'
    const currentSegment = segments[1]

    // Never interrupt onboarding
    if (currentSegment === 'onboarding') return

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome')
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/home')
    }
  }, [user, segments, loading])

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#080808',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ActivityIndicator color="#00E5A0" size="large" />
      </View>
    )
  }

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ErrorBoundary>
        <AuthGate>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
            <Stack.Screen name="results/[scanId]" options={{ presentation: 'card', gestureEnabled: true }} />
            <Stack.Screen name="ingredient/[ingredientId]" options={{ presentation: 'card', gestureEnabled: true }} />
          </Stack>
        </AuthGate>
      </ErrorBoundary>
    </GestureHandlerRootView>
  )
}