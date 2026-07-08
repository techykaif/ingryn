import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore, useDietaryStore, DietaryPreferences, DEFAULT_PREFERENCES } from '@/store'

export type { DietaryPreferences }

let currentUserForPrefs: string | null = null

export function useDietaryPreferences() {
  const { user } = useAuthStore()
  const { preferences, setPreferences } = useDietaryStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (user?.id) {
      if (currentUserForPrefs !== user.id) {
        currentUserForPrefs = user.id
        fetchPreferences()
      } else {
        setLoading(false)
      }
    } else {
      // Signed out — clear the cache marker and reset the shared store.
      // Without this, whichever user signs in next on this device would
      // inherit the previous user's allergies/conditions until they
      // happened to overwrite them, both for scan flagging and in the
      // Settings screen itself.
      currentUserForPrefs = null
      setPreferences(DEFAULT_PREFERENCES)
      setLoading(true)
    }
  }, [user?.id])

  async function fetchPreferences() {
    try {
      const { data } = await supabase
        .from('dietary_preferences')
        .select('conditions, allergies, diet_type')
        .eq('user_id', user?.id)
        .maybeSingle()

      // Always set preferences, even when this user has no saved row yet —
      // otherwise a signed-out-then-signed-in-as-someone-else session would
      // keep showing the previous user's data here.
      setPreferences(
        data
          ? {
              conditions: data.conditions || [],
              allergies: data.allergies || [],
              diet_type: data.diet_type || 'none',
            }
          : DEFAULT_PREFERENCES
      )
    } catch (e: any) {
      console.error('fetchPreferences error:', e)
      setErrorMsg(e.message || 'Could not load your dietary preferences.')
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences(prefs: DietaryPreferences): Promise<boolean> {
    if (!user?.id) {
      setErrorMsg('You must be logged in to save preferences.')
      return false
    }
    setSaving(true)
    setErrorMsg('')
    try {
      const { error } = await supabase
        .from('dietary_preferences')
        .upsert(
          {
            user_id: user?.id,
            conditions: prefs.conditions,
            allergies: prefs.allergies,
            diet_type: prefs.diet_type,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' } // ← tells Supabase to UPDATE if user_id already exists
        )

      if (error) throw error
      setPreferences(prefs) // Updates global state
      return true
    } catch (e: any) {
      console.error('savePreferences error:', e)
      setErrorMsg(e.message || 'Failed to save dietary preferences.')
      return false
    } finally {
      setSaving(false)
    }
  }

  return { preferences, loading, saving, errorMsg, setErrorMsg, savePreferences, fetchPreferences }
}