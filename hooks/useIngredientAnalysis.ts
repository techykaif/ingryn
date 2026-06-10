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
    return { scanId: '', error: e.message }
  }
}

async function saveIngredients(analysis: IngredientAnalysis[]): Promise<string[]> {
  const ingredientIds: string[] = []

  for (const ingredient of analysis) {
    const normalizedName = ingredient.name.toLowerCase().trim()

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

    if (!insertError && newIngredient?.id) {
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