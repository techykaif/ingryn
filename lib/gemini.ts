const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

export type IngredientAnalysis = {
  name: string
  aliases: string[]
  category: string
  description: string
  safety_level: 'safe' | 'caution' | 'harmful' | 'unknown'
  health_concerns: string[]
  country_status: Record<string, string>
}

export async function analyzeIngredients(ingredientText: string): Promise<IngredientAnalysis[]> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Check EXPO_PUBLIC_GEMINI_API_KEY in .env')
  }

  const prompt = `You are an ingredient safety expert and food scientist. Analyze these product ingredients and return a JSON array. Return ONLY valid JSON — no preamble, no markdown, no backticks. Your response must start with [ and end with ].

For each ingredient provide:
- name: string
- aliases: string[] (E-numbers, alternative names)
- category: string (e.g. "Preservative", "Artificial Colour", "Sweetener")
- description: string (2-3 sentences)
- safety_level: "safe" | "caution" | "harmful" | "unknown"
- health_concerns: string[] (empty array if none)
- country_status: object with keys: US, EU, UK, India, Australia, Canada, Japan, China
  Values must be one of: "permitted", "permitted_with_limits", "banned", "under_review", "no_data"

Ingredients to analyze: ${ingredientText}`

  let response: Response
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
      }),
    })
  } catch (fetchError: any) {
    throw new Error(`Network error: ${fetchError.message}`)
  }

  const rawText = await response.text()

  if (!response.ok) {
    let errorMessage = `Gemini API error ${response.status}`
    try {
      const errorData = JSON.parse(rawText)
      errorMessage = errorData?.error?.message || errorMessage
    } catch {}
    throw new Error(errorMessage)
  }

  let data: any
  try {
    data = JSON.parse(rawText)
  } catch {
    throw new Error('Failed to parse Gemini response')
  }

  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!textContent) throw new Error('No response from Gemini')

  const clean = textContent.replace(/```json|```/g, '').trim()

  let parsed: IngredientAnalysis[]
  try {
    parsed = JSON.parse(clean)
  } catch {
    throw new Error('Failed to parse ingredient analysis from Gemini')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini returned unexpected format')
  }

  return parsed
}