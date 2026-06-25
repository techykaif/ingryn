import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'

export type DietaryPreferences = {
  conditions: string[]
  allergies: string[]
  diet_type: string
}

const DEFAULT: DietaryPreferences = {
  conditions: [],
  allergies: [],
  diet_type: 'none',
}

export function useDietaryPreferences() {
  const { user } = useAuthStore()
  const [preferences, setPreferences] = useState<DietaryPreferences>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.id) fetchPreferences()
  }, [user?.id])

  async function fetchPreferences() {
    try {
      const { data } = await supabase
        .from('dietary_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (data) {
        setPreferences({
          conditions: data.conditions || [],
          allergies: data.allergies || [],
          diet_type: data.diet_type || 'none',
        })
      }
    } catch (e) {
      console.error('fetchPreferences error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences(prefs: DietaryPreferences): Promise<boolean> {
    setSaving(true)
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
      setPreferences(prefs)
      return true
    } catch (e) {
      console.error('savePreferences error:', e)
      return false
    } finally {
      setSaving(false)
    }
  }

  return { preferences, loading, saving, savePreferences, fetchPreferences }
}