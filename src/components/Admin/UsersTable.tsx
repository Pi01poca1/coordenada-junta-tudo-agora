import React, { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

type UserRow = {
  id: string
  email: string | null
  created_at: string
  last_sign_in_at: string | null
  name: string | null
  first_name: string | null
  last_name: string | null
  role: string | null
}

const PAGE_SIZE = 10

export default function UsersTable() {
  const { toast } = useToast()
  const [data, setData] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const load = async (currentPage: number) => {
    setLoading(true)
    try {
      // Usar a função segura para buscar dados de usuários
      const { data: rows, error } = await supabase.rpc('get_admin_users_data')

      if (error) throw error

      // Aplicar paginação no frontend para esta função
      const startIndex = currentPage * PAGE_SIZE
      const endIndex = startIndex + PAGE_SIZE
      const paginatedData = rows?.slice(startIndex, endIndex) || []
      
      // Verificar se há mais dados
      setHasMore(rows && rows.length > endIndex)
      setData(paginatedData)
    } catch (err: any) {
      console.error("UsersTable error:", err?.message || err)
      toast({
        title: "Erro ao carregar usuários",
        description: "Verifique se você tem permissões de administrador.",
        variant: "destructive",
      })
      setData([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(page)
  }, [page])

  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Usuários (visão do Admin)</h2>
        <div className="text-sm text-muted-foreground">
          {loading ? "Carregando..." : `Página ${page + 1}`}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Papel</th>
              <th className="px-4 py-2">Criado em</th>
              <th className="px-4 py-2">Último Login</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              data.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">
                    {u.name || u.first_name || "—"}
                  </td>
                  <td className="px-4 py-2">{u.email || "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      u.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(u.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {u.last_sign_in_at 
                      ? new Date(u.last_sign_in_at).toLocaleString() 
                      : "Nunca"
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Button
          variant="outline"
          disabled={page === 0 || loading}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          disabled={!hasMore || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}