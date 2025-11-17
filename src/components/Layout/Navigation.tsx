import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useIsAdmin } from "@/hooks/useIsAdmin"
import { supabase } from "@/integrations/supabase/client"
import logo from "/lovable-uploads/31e2a8d7-b979-4013-8ea3-90c8ccc92055.png"

export function Navigation() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [userName, setUserName] = React.useState<string>("")

  React.useEffect(() => {
    if (user) {
      // Buscar o nome do usuário no perfil
      const fetchUserName = async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single()
          
          if (data?.name) {
            setUserName(data.name)
          } else {
            setUserName(user.email?.split('@')[0] || 'Usuário')
          }
        } catch {
          setUserName(user.email?.split('@')[0] || 'Usuário')
        }
      }
      
      fetchUserName()
    }
  }, [user])

  const { isAdmin } = useIsAdmin()

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-white">
      <Link to="/dashboard" className="flex items-center space-x-2">
        <img src={logo} alt="Androvox Logo" className="h-20 w-auto object-contain" />
      </Link>

      <div className="flex items-center gap-6">
        {isAdmin && (
          <Link to="/admin" className="font-semibold text-red-600 hover:underline">
            Admin
          </Link>
        )}
        <Link to="/statistics" className="text-gray-700 hover:underline">
          Estatísticas
        </Link>
        <Link to="/docs/overview" className="text-gray-700 hover:underline">
          Documentação
        </Link>
        <Link to="/manual" className="text-gray-700 hover:underline">
          Manual
        </Link>
        <Link to="/profile" className="text-gray-700 hover:underline">
          Perfil
        </Link>

        {userName && (
          <span className="hidden sm:inline text-sm text-gray-500">
            {userName}
          </span>
        )}

        <button
          onClick={async () => {
            try {
              await signOut?.()
            } finally {
              navigate("/login", { replace: true })
            }
          }}
          className="px-3 py-1 rounded-md border text-gray-700 hover:bg-gray-50"
        >
          Sair
        </button>
      </div>
    </nav>
  )
}

export default Navigation