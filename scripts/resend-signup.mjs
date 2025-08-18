import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

const email = process.argv[2]
if (!email) {
  console.error("Uso: node scripts/resend-signup.mjs email@exemplo.com")
  process.exit(1)
}

// tenta ler as chaves do ambiente ou do .env.local (Vite)
let supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
let supabaseAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8")
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*(VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY|VITE_SITE_URL)\s*=\s*(.+)\s*$/)
    if (m) {
      if (m[1] === "VITE_SUPABASE_URL" && !supabaseUrl) supabaseUrl = m[2]
      if (m[1] === "VITE_SUPABASE_ANON_KEY" && !supabaseAnon) supabaseAnon = m[2]
      if (m[1] === "VITE_SITE_URL" && !process.env.VITE_SITE_URL) process.env.VITE_SITE_URL = m[2]
    }
  }
}

if (!supabaseUrl || !supabaseAnon) {
  console.error("Faltam SUPABASE URL/ANON. Garanta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local")
  process.exit(1)
}

const redirectTo = process.env.VITE_SITE_URL || "http://192.168.15.10:8080/login"
const supabase = createClient(supabaseUrl, supabaseAnon)

const { error } = await supabase.auth.resend({
  type: "signup",
  email,
  options: { emailRedirectTo: redirectTo },
})

if (error) {
  console.error("Resend error:", error)
  process.exit(1)
} else {
  console.log("✅ E-mail de confirmação reenviado para", email, "→", redirectTo)
}
