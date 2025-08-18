import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

type AdminStats = {
  totalBooks: number
  totalChapters: number
  chapters7d: number
}

export default function AdminStats() {
  const [stats, setStats] = useState<AdminStats>({ totalBooks: 0, totalChapters: 0, chapters7d: 0 })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const { count: totalBooks, error: e1 } = await supabase
          .from("books")
          .select("*", { count: "exact", head: true })
        if (e1) throw e1

        const { count: totalChapters, error: e2 } = await supabase
          .from("chapters")
          .select("*", { count: "exact", head: true })
        if (e2) throw e2

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const { count: chapters7d, error: e3 } = await supabase
          .from("chapters")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", sevenDaysAgo.toISOString())
        if (e3) throw e3

        setStats({
          totalBooks: totalBooks ?? 0,
          totalChapters: totalChapters ?? 0,
          chapters7d: chapters7d ?? 0,
        })
      } catch (err: any) {
        console.error("AdminStats error:", err?.message || err)
        toast({
          title: "Erro",
          description: "Não foi possível carregar estatísticas globais. Verifique políticas RLS.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total de Livros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{loading ? "…" : stats.totalBooks}</div>
          <p className="text-xs text-muted-foreground">Visão global (conforme RLS)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total de Capítulos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{loading ? "…" : stats.totalChapters}</div>
          <p className="text-xs text-muted-foreground">Visão global (conforme RLS)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Capítulos atualizados (7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{loading ? "…" : stats.chapters7d}</div>
          <p className="text-xs text-muted-foreground">Atividade recente</p>
        </CardContent>
      </Card>
    </div>
  )
}
