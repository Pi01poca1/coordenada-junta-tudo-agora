import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    console.log("🔐 Tentando reset de senha para:", email)
    
    if (!email || !email.trim()) {
      console.error("❌ Email não fornecido")
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      console.error("❌ Email inválido:", email)
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // URL de redirecionamento
    const redirectUrl = "https://e50f4fda-55f8-4d52-aab2-82f9e3b02574.sandbox.lovable.dev/login"
    
    console.log("📧 Enviando email de reset com redirect para:", redirectUrl)

    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl
    })

    if (error) {
      console.error("❌ Erro ao enviar email de reset:", error)
      
      // Tratamento específico de erros
      if (error.message?.includes('429') || error.message?.includes('email_rate_limit_exceeded') || error.message?.includes('rate limit')) {
        return new Response(
          JSON.stringify({ 
            error: "Muitas tentativas de recuperação. Aguarde alguns minutos antes de tentar novamente." 
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        )
      } else if (error.message?.includes('User not found') || error.message?.includes('not found')) {
        return new Response(
          JSON.stringify({ 
            error: "Email não encontrado no sistema. Verifique se você já se cadastrou." 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        )
      } else {
        return new Response(
          JSON.stringify({ error: error.message || "Erro interno do servidor" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        )
      }
    }

    console.log("✅ Email de reset enviado com sucesso")

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de recuperação enviado com sucesso. Verifique sua caixa de entrada e pasta de spam.",
        redirectUrl: redirectUrl
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )

  } catch (error: any) {
    console.error("💥 Erro inesperado na função reset-password:", error)
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor. Tente novamente em alguns minutos." }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})