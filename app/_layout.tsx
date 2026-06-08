import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { View, ActivityIndicator } from 'react-native'
import 'react-native-url-polyfill/auto'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/index'
import { User } from '@supabase/supabase-js'

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
    const inTabsGroup = segments[0] === '(tabs)'

    if (!user && !inAuthGroup) {
      // Not logged in — always push back to welcome, no going back
      router.replace('/(auth)/welcome')
    } else if (user && inAuthGroup) {
      // Logged in — always push to home, can't go back to auth
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
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: false, // prevents swipe-back bypassing auth
            animation: 'fade',
          }}
        >
          <Stack.Screen
            name="(auth)"
            options={{
              gestureEnabled: false, // can't swipe back into auth once logged in
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              gestureEnabled: false, // can't swipe back to auth from tabs
            }}
          />
          <Stack.Screen
            name="results/[scanId]"
            options={{
              presentation: 'card',
              gestureEnabled: true, // can swipe back within app
            }}
          />
          <Stack.Screen
            name="ingredient/[ingredientId]"
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
        </Stack>
      </AuthGate>
    </GestureHandlerRootView>
  )
}