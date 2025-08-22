import { useAuth } from "@/contexts/AuthContext"

export function useIsAdmin() {
  const { user } = useAuth()
  const list = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  const email = (user?.email || "").toLowerCase()
  return email.length > 0 && list.includes(email)
}
