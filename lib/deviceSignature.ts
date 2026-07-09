import * as Application from 'expo-application'
import * as Device from 'expo-device'
import * as Crypto from 'expo-crypto'
import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'

export async function getDeviceSignature(): Promise<string> {
  if (Platform.OS === 'web') {
    return 'web-device-signature'
  }

  let deviceId = ''
  if (Platform.OS === 'ios') {
    deviceId = await Application.getIosIdForVendorAsync() || ''
  } else if (Platform.OS === 'android') {
    deviceId = Application.getAndroidId() || ''
  }

  const modelName = Device.modelName || 'unknown'
  const brand = Device.brand || 'unknown'

  const rawSignature = `${deviceId}-${brand}-${modelName}`

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawSignature
  )

  return hash
}

export async function trackDeviceSession(userId: string) {
  try {
    const signature = await getDeviceSignature()
    const { error } = await supabase.functions.invoke('track-device', {
      body: { device_signature: signature, user_id: userId }
    })
    if (error) {
      console.error('Error tracking device session:', error)
    }
  } catch (error) {
    console.error('Failed to track device session:', error)
  }
}
