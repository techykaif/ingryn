import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const CHUNK_SIZE = 2000

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      const metadataStr = await SecureStore.getItemAsync(key + '_meta')
      if (!metadataStr) return await SecureStore.getItemAsync(key) // Fallback for old unchunked sessions
      
      const chunksCount = parseInt(metadataStr, 10)
      let fullString = ''
      for (let i = 0; i < chunksCount; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`)
        if (!chunk) return null // Data corrupted or missing
        fullString += chunk
      }
      return fullString
    } catch (e) {
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      const prevMeta = await SecureStore.getItemAsync(key + '_meta').catch(() => null)
      const prevChunks = prevMeta ? parseInt(prevMeta, 10) : 0

      if (value.length <= CHUNK_SIZE) {
        if (prevChunks > 0) {
          for (let i = 0; i < prevChunks; i++) {
            await SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(() => {})
          }
        }
        await SecureStore.deleteItemAsync(key + '_meta').catch(() => {})
        await SecureStore.setItemAsync(key, value)
        return
      }
      
      const chunksCount = Math.ceil(value.length / CHUNK_SIZE)
      await SecureStore.setItemAsync(key + '_meta', chunksCount.toString())
      
      for (let i = 0; i < chunksCount; i++) {
        const chunk = value.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk)
      }

      if (prevChunks > chunksCount) {
        for (let i = chunksCount; i < prevChunks; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(() => {})
        }
      }

      await SecureStore.deleteItemAsync(key).catch(() => {})
    } catch (e) {
      console.error('SecureStore setItem error', e)
    }
  },
  removeItem: async (key: string) => {
    try {
      const metadataStr = await SecureStore.getItemAsync(key + '_meta')
      if (metadataStr) {
        const chunksCount = parseInt(metadataStr, 10)
        for (let i = 0; i < chunksCount; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(() => {})
        }
        await SecureStore.deleteItemAsync(key + '_meta').catch(() => {})
      }
      await SecureStore.deleteItemAsync(key).catch(() => {})
    } catch (e) {
      console.error('SecureStore removeItem error', e)
    }
  },
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? AsyncStorage : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})