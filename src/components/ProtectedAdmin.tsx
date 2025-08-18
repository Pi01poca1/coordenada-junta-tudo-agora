import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useIsAdmin } from "@/hooks/useIsAdmin"

export function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const isAdmin = useIsAdmin()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
