import { supabase } from '@/lib/supabase'
import { analyzeIngredients, IngredientAnalysis } from '@/lib/gemini'

export async function saveAnalysis(
  text: string,
  userId: string
): Promise<{ scanId: string; error?: string }> {
  try {
    const analysis = await analyzeIngredients(text)

    if (!analysis || analysis.length === 0) {
      throw new Error('No ingredients could be identified')
    }

    const ingredientIds = await saveIngredients(analysis)
    const safetyScore = calculateSafetyScore(analysis)
    const scanId = await saveScan({ userId, text, safetyScore, ingredientIds })

    return { scanId }
  } catch (e: any) {
    const raw = e.message || ''
    let message = raw

    if (
      raw.includes('429') ||
      raw.includes('quota') ||
      raw.includes('high demand') ||
      raw.includes('RESOURCE_EXHAUSTED') ||
      raw.includes('overloaded')
    ) {
      message = 'Our AI is a bit busy right now. Please wait a few seconds and try again.'
    } else if (raw.includes('Network') || raw.includes('fetch') || raw.includes('Failed to fetch')) {
      message = 'No internet connection. Please check your network and try again.'
    } else if (raw.includes('No ingredients')) {
      message = 'No ingredients found. Try scanning again or type them manually.'
    } else if (raw.includes('API key') || raw.includes('API_KEY')) {
      message = 'Configuration error. Please restart the app.'
    }

    return { scanId: '', error: message }
  }
}

async function saveIngredients(analysis: IngredientAnalysis[]): Promise<string[]> {
  const ingredientIds: string[] = []

  for (const ingredient of analysis) {
    const normalizedName = ingredient.name.toLowerCase().trim()

    // Check cache first — avoid duplicate Supabase inserts
    const { data: existing } = await supabase
      .from('ingredients')
      .select('id')
      .eq('name', normalizedName)
      .maybeSingle()

    if (existing?.id) {
      ingredientIds.push(existing.id)
      continue
    }

    const { data: newIngredient, error: insertError } = await supabase
      .from('ingredients')
      .insert({
        name: normalizedName,
        aliases: ingredient.aliases || [],
        category: ingredient.category || 'Unknown',
        description: ingredient.description || '',
        safety_level: ingredient.safety_level || 'unknown',
        health_concerns: ingredient.health_concerns || [],
        country_status: ingredient.country_status || {},
      })
      .select('id')
      .single()

    // Handle race condition — another request may have inserted same ingredient
    if (insertError) {
      if (insertError.code === '23505') {
        // Unique constraint violation — fetch the existing one
        const { data: raceExisting } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', normalizedName)
          .maybeSingle()
        if (raceExisting?.id) ingredientIds.push(raceExisting.id)
      }
      continue
    }

    if (newIngredient?.id) {
      ingredientIds.push(newIngredient.id)
    }
  }

  return ingredientIds
}

async function saveScan({
  userId,
  text,
  safetyScore,
  ingredientIds,
}: {
  userId: string
  text: string
  safetyScore: number
  ingredientIds: string[]
}): Promise<string> {
  const { data: scan, error } = await supabase
    .from('scans')
    .insert({
      user_id: userId,
      raw_ocr_text: text,
      safety_score: safetyScore,
      ingredient_ids: ingredientIds,
      label: null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return scan.id
}

function calculateSafetyScore(analysis: IngredientAnalysis[]): number {
  if (!analysis.length) return 50
  const weights = { safe: 100, caution: 50, harmful: 0, unknown: 60 }
  const total = analysis.reduce((sum, i) => {
    return sum + (weights[i.safety_level as keyof typeof weights] ?? 60)
  }, 0)
  return Math.round(total / analysis.length)
}