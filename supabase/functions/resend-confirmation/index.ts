import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    console.log("🔄 Tentando reenviar confirmação para:", email)
    
    if (!email || !email.trim()) {
      console.error("❌ Email não fornecido")
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      console.error("❌ Email inválido:", email)
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    console.log("📧 Enviando reenvio de confirmação...")
    const { error } = await supabaseClient.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: `${Deno.env.get("SITE_URL") || "https://e50f4fda-55f8-4d52-aab2-82f9e3b02574.sandbox.lovable.dev"}/login`
      }
    })

    if (error) {
      console.error("❌ Erro ao reenviar confirmação:", error)
      
      // Tratamento específico de erros
      if (error.message?.includes('429') || error.message?.includes('email_rate_limit_exceeded') || error.message?.includes('rate limit')) {
        return new Response(
          JSON.stringify({ 
            error: "Muitas tentativas de reenvio. Aguarde alguns minutos antes de tentar novamente." 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      } else if (error.message?.includes('User not found') || error.message?.includes('not found')) {
        return new Response(
          JSON.stringify({ 
            error: "Email não encontrado no sistema. Verifique se você já se cadastrou." 
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      } else if (error.message?.includes('already confirmed') || error.message?.includes('confirmed')) {
        return new Response(
          JSON.stringify({ 
            error: "Este email já foi confirmado. Tente fazer login." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      } else {
        return new Response(
          JSON.stringify({ error: error.message || "Erro interno do servidor" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    console.log("✅ Email de confirmação reenviado com sucesso")
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de confirmação reenviado com sucesso. Verifique sua caixa de entrada e pasta de spam." 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    console.error("💥 Erro inesperado na função:", error)
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor. Tente novamente em alguns minutos." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})