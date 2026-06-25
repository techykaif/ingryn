import { supabase } from '@/lib/supabase'
// removed unused import from './useDietaryPreferences'
import { analyzeIngredients, IngredientAnalysis, UserPreferences } from '@/lib/gemini'

export async function saveAnalysis(
  text: string,
  userId: string,
  preferences?: UserPreferences
): Promise<{ scanId: string; error?: string }> {
  try {
    const ingredientNames = parseIngredientNames(text)

    if (ingredientNames.length === 0) {
      throw new Error('No ingredients could be identified')
    }

    // Step 1: Check cache for all ingredients at once
    const { cachedIds, unknownNames } = await checkCache(ingredientNames)

    // Step 2: Only call Gemini for ingredients not in cache
    let newIds: string[] = []
    if (unknownNames.length > 0) {
      const analysis = await analyzeIngredients(unknownNames.join(', '), preferences)
      newIds = await saveIngredients(analysis)
    }

    // Step 3: Combine cached + new ingredient IDs
    const ingredientIds = [...cachedIds, ...newIds]

    if (ingredientIds.length === 0) {
      throw new Error('No ingredients could be identified')
    }

    // Step 4: Calculate safety score from DB
    const allIngredients = await fetchIngredientsByIds(ingredientIds)
    const safetyScore = calculateSafetyScore(allIngredients)

    // Step 5: Save scan
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
    } else if (
      raw.includes('Network') ||
      raw.includes('fetch') ||
      raw.includes('Failed to fetch')
    ) {
      message = 'No internet connection. Please check your network and try again.'
    } else if (raw.includes('No ingredients')) {
      message = 'No ingredients found. Try scanning again or type them manually.'
    } else if (raw.includes('API key') || raw.includes('API_KEY')) {
      message = 'Configuration error. Please restart the app.'
    }

    return { scanId: '', error: message }
  }
}

// Split raw text into individual ingredient names
function parseIngredientNames(text: string): string[] {
  return text
    .split(/,|;|\n/)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 1 && s.length < 100)
}

// Single Supabase query to check which ingredients are already cached
async function checkCache(names: string[]): Promise<{
  cachedIds: string[]
  unknownNames: string[]
}> {
  const { data: existing } = await supabase
    .from('ingredients')
    .select('id, name')
    .in('name', names)

  const cachedIds: string[] = []
  const cachedNames = new Set<string>()

  for (const row of existing || []) {
    cachedIds.push(row.id)
    cachedNames.add(row.name)
  }

  const unknownNames = names.filter(n => !cachedNames.has(n))

  return { cachedIds, unknownNames }
}

// Fetch ingredients by IDs to calculate safety score
async function fetchIngredientsByIds(
  ids: string[]
): Promise<{ safety_level: string }[]> {
  if (ids.length === 0) return []
  const { data } = await supabase
    .from('ingredients')
    .select('safety_level')
    .in('id', ids)
  return (data || []) as { safety_level: string }[]
}

// Save new ingredients returned by Gemini
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
        personal_flag: ingredient.personal_flag ?? null,
        safety_level: ingredient.safety_level || 'unknown',
        health_concerns: ingredient.health_concerns || [],
        country_status: ingredient.country_status || {},
      })
      .select('id')
      .single()

    // Handle race condition
    if (insertError) {
      if (insertError.code === '23505') {
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

function calculateSafetyScore(ingredients: { safety_level: string }[]): number {
  if (!ingredients.length) return 50
  const weights: Record<string, number> = {
    safe: 100,
    caution: 50,
    harmful: 0,
    unknown: 60,
  }
  const total = ingredients.reduce((sum, i) => {
    return sum + (weights[i.safety_level] ?? 60)
  }, 0)
  return Math.round(total / ingredients.length)
}