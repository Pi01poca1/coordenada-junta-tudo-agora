import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  const list = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return list.includes(email.toLowerCase())
}

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando…</div>
      </div>
    )
  }

  // Não logado ? manda para /login e depois retorna ao /admin
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Logado mas não é admin ? manda para dashboard
  if (!isAdminEmail(user.email)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
