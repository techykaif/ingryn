import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { supabase } from './supabase'

import { Platform } from 'react-native'

// Configure Google Sign-In with env variables (only on native, as web requires sponsor package)
if (Platform.OS !== 'web') {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID

  if (!webClientId || !iosClientId) {
    throw new Error(
      'Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID or EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID. ' +
      'Check your .env file or EAS Secrets.'
    )
  }

  GoogleSignin.configure({
    scopes: ['email', 'profile'],
    webClientId,
    iosClientId,
  })
}

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices()
    const userInfo = await GoogleSignin.signIn()
    
    if (!userInfo.data?.idToken) {
      throw new Error('Google Sign-In failed: No ID token returned.')
    }

    const { error, data } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.data.idToken,
    })

    if (error) throw error
    return { success: true, data }
  } catch (e: any) {
    if (e.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, error: 'canceled' }
    }
    throw e
  }
}
