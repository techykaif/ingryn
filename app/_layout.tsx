import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { View, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-url-polyfill/auto'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/index'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Colors } from '@/constants/theme'
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

const ONBOARDING_KEY = 'ingryn_onboarding_complete'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore()
  const [authLoading, setAuthLoading] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const router = useRouter()
  const segments = useSegments()

  // ─── Auth listener ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ─── Re-read onboarding flag on every segment change ───────────────
  // Direct AsyncStorage read avoids the two-instance hook problem
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(value => {
      setOnboardingComplete(value !== null)
      setOnboardingChecked(true)
    })
  }, [segments])

  // ─── Routing logic ─────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading || !onboardingChecked) return

    const inAuthGroup = segments[0] === '(auth)'
    const currentSegment = segments[1]

    // Never interrupt the onboarding screen itself
    if (currentSegment === 'onboarding') return

    // Public pages that must render regardless of auth state — legal pages
    // need to be viewable before signup, reset-password needs to work
    // whether or not a session exists yet. Never gate these.
    const publicStandaloneRoutes = new Set(['legal', 'reset-password'])
    if (publicStandaloneRoutes.has(segments[0] ?? '')) return

    const inTabsGroup = segments[0] === '(tabs)'
    // Detail routes that only make sense when signed in — excluded from the
    // logged-in "bounce to home" check, but still gated for logged-out users
    const authOnlyDetailRoutes = new Set(['results', 'ingredient'])
    const onRootIndex = !inAuthGroup && !inTabsGroup
      && !authOnlyDetailRoutes.has(segments[0] ?? '')

    if (user) {
      // Redirect logged-in users to home if they're on the auth screens
      // or on the root index (which just shows a loader)
      if (inAuthGroup || onRootIndex) {
        router.replace('/(tabs)/home')
      }
    } else {
      // KEY: only redirect to onboarding if NOT already in auth group
      // Without this, navigating onboarding→welcome bounces back
      if (!onboardingComplete && !inAuthGroup) {
        router.replace('/(auth)/onboarding')
      } else if (onboardingComplete && !inAuthGroup) {
        router.replace('/(auth)/welcome')
      }
      // If inAuthGroup → do nothing, let screens handle their own navigation
    }
  }, [user, segments, authLoading, onboardingChecked, onboardingComplete])

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