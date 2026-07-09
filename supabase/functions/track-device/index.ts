// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: "Server configuration error: missing service role key" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // Authenticate the user making the request using anon key
    const supabaseUserAuth = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: authError } = await supabaseUserAuth.auth.getUser(authHeader.replace("Bearer ", ""))
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const { device_signature, user_id } = await req.json()

    if (!device_signature || typeof device_signature !== "string") {
      return new Response(JSON.stringify({ error: "device_signature is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }
    
    // Optional: enforce that user_id matches authenticated user
    if (user.id !== user_id) {
      return new Response(JSON.stringify({ error: "Unauthorized user mismatch" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // Use service role for database writes to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 1. Ensure the device exists
    await supabaseAdmin.from('devices').upsert(
      { device_signature },
      { onConflict: 'device_signature' }
    )

    // 2. Link user to device and mark session as active
    await supabaseAdmin.from('user_devices').upsert(
      { 
        user_id, 
        device_signature,
        is_active: true,
        last_active_at: new Date().toISOString()
      },
      { onConflict: 'user_id,device_signature' } // Ensure this matches your UNIQUE constraint
    )

    // 3. Count distinct accounts on this device
    const { count } = await supabaseAdmin
      .from('user_devices')
      .select('*', { count: 'exact', head: true })
      .eq('device_signature', device_signature)

    const accountCount = count || 1

    // 4. Update the total count on the device
    await supabaseAdmin.from('devices')
      .update({ account_count: accountCount, updated_at: new Date().toISOString() })
      .eq('device_signature', device_signature)

    // 5. Flag device if it exceeds a reasonable account threshold (e.g., > 3)
    if (accountCount > 3) {
      await supabaseAdmin.from('device_flags').upsert(
        {
          device_signature,
          status: 'flagged',
          reason: `Suspicious activity: ${accountCount} accounts used on this device.`
        },
        { onConflict: 'device_signature' }
      )
    }

    return new Response(JSON.stringify({ success: true, accountCount }), {
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
