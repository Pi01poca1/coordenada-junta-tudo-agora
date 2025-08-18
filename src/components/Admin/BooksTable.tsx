import React, { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

type BookRow = {
  id: string
  title: string | null
  created_at: string
  owner_id: string | null
}

const PAGE_SIZE = 10

export default function BooksTable() {
  const { toast } = useToast()
  const [data, setData] = useState<BookRow[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const load = async (currentPage: number) => {
    setLoading(true)
    try {
      const from = currentPage * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      // Busca livros visíveis pelas políticas RLS atuais
      const { data: rows, error } = await supabase
        .from("books")
        .select("id,title,created_at,owner_id")
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) throw error

      // Heurística simples p/ saber se há próxima página
      const { data: nextRows, error: e2 } = await supabase
        .from("books")
        .select("id", { count: "exact", head: false })
        .range(to + 1, to + 1)

      if (e2) {
        setHasMore(false)
      } else {
        setHasMore(!!(nextRows && nextRows.length > 0))
      }

      setData(rows ?? [])
    } catch (err: any) {
      console.error("BooksTable error:", err?.message || err)
      toast({
        title: "Erro ao carregar livros",
        description:
          "Pode ser uma restrição de políticas RLS. Revise permissões se desejar visão global.",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Livros (visão do Admin)</h2>
        <div className="text-sm text-muted-foreground">
          {loading ? "Carregando..." : `Página ${page + 1}`}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-2">Título</th>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Dono (owner_id)</th>
              <th className="px-4 py-2">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhum livro encontrado (verifique RLS/visibilidade).
                </td>
              </tr>
            ) : (
              data.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{b.title || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{b.id}</td>
                  <td className="px-4 py-2 font-mono text-xs">{b.owner_id || "—"}</td>
                  <td className="px-4 py-2">
                    {new Date(b.created_at).toLocaleString()}
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
