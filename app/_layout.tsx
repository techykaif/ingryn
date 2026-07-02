import { useEffect, useState, type ReactNode } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { View, ActivityIndicator } from 'react-native'
import 'react-native-url-polyfill/auto'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/index'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Colors } from '@/constants/theme'
import { getOnboardingComplete } from '@/constants/onboarding'
import {
  useFonts,
  PlusJakartaSans_200ExtraLight,
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium_Italic,
  PlusJakartaSans_700Bold_Italic,
} from '@expo-google-fonts/plus-jakarta-sans'

function AuthGate({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuthStore()
  const [authLoading, setAuthLoading] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) setUser(session?.user ?? null)
      } catch (error) {
        console.warn('Failed to load session', error)
      } finally {
        if (mounted) setAuthLoading(false)
      }
    }

    void loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser])

  useEffect(() => {
    let mounted = true

    const loadOnboarding = async () => {
      try {
        const complete = await getOnboardingComplete()
        if (mounted) {
          setOnboardingComplete(complete)
          setOnboardingChecked(true)
        }
      } catch (error) {
        if (mounted) {
          setOnboardingComplete(false)
          setOnboardingChecked(true)
        }
      }
    }

    void loadOnboarding()

    return () => {
      mounted = false
    }
  }, [segments])

  useEffect(() => {
    if (authLoading || !onboardingChecked) return

    const inAuthGroup = segments[0] === '(auth)'
    const currentSegment = segments[1]
    if (currentSegment === 'onboarding') return

    const publicStandaloneRoutes = new Set(['legal', 'reset-password'])
    if (publicStandaloneRoutes.has(segments[0] ?? '')) return

    const inTabsGroup = segments[0] === '(tabs)'
    const authOnlyDetailRoutes = new Set(['results', 'ingredient'])
    const onRootIndex = !inAuthGroup && !inTabsGroup && !authOnlyDetailRoutes.has(segments[0] ?? '')

    if (user) {
      if (inAuthGroup || onRootIndex) {
        router.replace('/(tabs)/home')
      }
    } else {
      if (!onboardingComplete && !inAuthGroup) {
        router.replace('/(auth)/onboarding')
      } else if (onboardingComplete && !inAuthGroup) {
        router.replace('/(auth)/welcome')
      }
    }
  }, [user, segments, authLoading, onboardingChecked, onboardingComplete, router])

  if (authLoading || !onboardingChecked) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  return <>{children}</>
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_200ExtraLight,
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    PlusJakartaSans_400Regular_Italic,
    PlusJakartaSans_500Medium_Italic,
    PlusJakartaSans_700Bold_Italic,
  })

  if (!fontsLoaded) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
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
            <Stack.Screen name="legal/[type]" options={{ presentation: 'card', gestureEnabled: true }} />
            <Stack.Screen name="reset-password" options={{ presentation: 'card', gestureEnabled: false }} />
          </Stack>
        </AuthGate>
      </ErrorBoundary>
    </GestureHandlerRootView>
  )
}