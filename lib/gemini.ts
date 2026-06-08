const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

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

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) throw new Error('No response from Gemini')

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    throw new Error('Failed to parse Gemini response')
  }
}