// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type UserPreferences = {
  conditions: string[]
  allergies: string[]
  diet_type: string
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured on the server." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { ingredientText, preferences } = (await req.json()) as {
      ingredientText?: string
      preferences?: UserPreferences
    }

    if (!ingredientText || typeof ingredientText !== "string") {
      return new Response(JSON.stringify({ error: "ingredientText is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Real ingredient labels are rarely more than a few hundred characters.
    // Cap generously above that to block abuse (huge payloads run up Gemini
    // costs and can blow past its context window) without risking false
    // rejections of legitimate long labels.
    const MAX_INPUT_LENGTH = 3000
    if (ingredientText.length > MAX_INPUT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `ingredientText exceeds maximum length of ${MAX_INPUT_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const cleanedInput = ingredientText
      .replace(/\n/g, ", ")
      .replace(/[^\w\s,.()\-\/]/g, "")
      .replace(/\s+/g, " ")
      .trim()

    const preferencesContext =
      preferences &&
      (preferences.conditions?.length > 0 ||
        preferences.allergies?.length > 0 ||
        preferences.diet_type !== "none")
        ? `
User health context (flag ingredients relevant to these):
- Health conditions: ${preferences.conditions?.length > 0 ? preferences.conditions.join(", ") : "none"}
- Allergies: ${preferences.allergies?.length > 0 ? preferences.allergies.join(", ") : "none"}
- Diet type: ${preferences.diet_type && preferences.diet_type !== "none" ? preferences.diet_type : "no specific diet"}
`
        : ""

    const prompt = `You are an ingredient safety expert and food scientist. Analyze these product ingredients and return a JSON array. Return ONLY valid JSON — no preamble, no markdown, no backticks, no explanations. Your response must start with [ and end with ].
${preferencesContext}
For each ingredient provide:
- name: string
- aliases: string[] (E-numbers, alternative names)
- category: string (e.g. "Preservative", "Artificial Colour", "Sweetener")
- description: string (2-3 sentences)
- safety_level: "safe" | "caution" | "harmful" | "unknown"
- health_concerns: string[] (empty array if none)
- country_status: object with keys: US, EU, UK, India, Australia, Canada, Japan, China
  Values must be one of: "permitted", "permitted_with_limits", "banned", "under_review", "no_data"
- personal_flag: string | null (only if this ingredient is relevant to the user's health conditions or allergies — explain why briefly, otherwise null)

Ingredients to analyze: ${cleanedInput}`

    const parsed = await callGemini(prompt)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function callGemini(prompt: string, retryCount = 0): Promise<unknown[]> {
  let response: Response
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
      }),
    })
  } catch (fetchError) {
    throw new Error(`Network error reaching Gemini: ${(fetchError as Error).message}`)
  }

  // Rate limit — retry with backoff, same as before
  if (response.status === 429 && retryCount < 3) {
    const delay = (retryCount + 1) * 8000
    await new Promise((resolve) => setTimeout(resolve, delay))
    return callGemini(prompt, retryCount + 1)
  }

  const rawText = await response.text()

  if (!response.ok) {
    let errorMessage = `Gemini API error ${response.status}`
    try {
      const errorData = JSON.parse(rawText)
      errorMessage = errorData?.error?.message || errorMessage
    } catch {
      // not JSON — keep default message
    }
    throw new Error(errorMessage)
  }

  let data: any
  try {
    data = JSON.parse(rawText)
  } catch {
    throw new Error("Failed to parse Gemini response")
  }

  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!textContent) throw new Error("No response from Gemini")

  let clean = textContent
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .replace(/^\s*[\r\n]/gm, "")
    .trim()

  const arrayMatch = clean.match(/\[[\s\S]*\]/)
  if (arrayMatch) clean = arrayMatch[0]

  try {
    const result = JSON.parse(clean)
    if (!Array.isArray(result)) throw new Error("Gemini returned unexpected format")
    return result
  } catch {
    const start = textContent.indexOf("[")
    const end = textContent.lastIndexOf("]")
    if (start !== -1 && end !== -1 && end > start) {
      const result = JSON.parse(textContent.substring(start, end + 1))
      if (!Array.isArray(result)) throw new Error("Gemini returned unexpected format")
      return result
    }
    throw new Error("Failed to parse ingredient analysis from Gemini")
  }
}