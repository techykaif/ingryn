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

  const cleanedInput = ingredientText
    .replace(/\n/g, ', ')
    .replace(/[^\w\s,.()\-\/]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const prompt = `You are an ingredient safety expert and food scientist. Analyze these product ingredients and return a JSON array. Return ONLY valid JSON — no preamble, no markdown, no backticks, no explanations. Your response must start with [ and end with ].

For each ingredient provide:
- name: string
- aliases: string[] (E-numbers, alternative names)
- category: string (e.g. "Preservative", "Artificial Colour", "Sweetener")
- description: string (2-3 sentences)
- safety_level: "safe" | "caution" | "harmful" | "unknown"
- health_concerns: string[] (empty array if none)
- country_status: object with keys: US, EU, UK, India, Australia, Canada, Japan, China
  Values must be one of: "permitted", "permitted_with_limits", "banned", "under_review", "no_data"

Ingredients to analyze: ${cleanedInput}`

  const makeRequest = async (retryCount = 0): Promise<IngredientAnalysis[]> => {
    let response: Response
    try {
      response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
    } catch (fetchError: any) {
      throw new Error(`Network error: ${fetchError.message}`)
    }

    // Rate limit — auto retry with backoff
    if (response.status === 429 && retryCount < 3) {
      const delay = (retryCount + 1) * 8000
      await new Promise(resolve => setTimeout(resolve, delay))
      return makeRequest(retryCount + 1)
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

    // Aggressively clean markdown wrappers
    let clean = textContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim()

    // Extract just the JSON array even if there's surrounding text
    const arrayMatch = clean.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      clean = arrayMatch[0]
    }

    let parsed: IngredientAnalysis[]
    try {
      parsed = JSON.parse(clean)
    } catch {
      // Last resort — slice from first [ to last ]
      const start = textContent.indexOf('[')
      const end = textContent.lastIndexOf(']')
      if (start !== -1 && end !== -1 && end > start) {
        try {
          parsed = JSON.parse(textContent.substring(start, end + 1))
        } catch {
          throw new Error('Failed to parse ingredient analysis from Gemini')
        }
      } else {
        throw new Error('Failed to parse ingredient analysis from Gemini')
      }
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Gemini returned unexpected format')
    }

    return parsed
  }

  return makeRequest()
}