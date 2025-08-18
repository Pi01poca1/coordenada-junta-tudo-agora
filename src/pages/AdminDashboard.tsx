import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/Layout/Navigation"
import { Users, BookOpen, FileText, Bot, CreditCard, AlertTriangle, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
            <p className="text-muted-foreground">Visão geral do sistema e controles do proprietário</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Exportar Relatório</Button>
            <Button>Configurações</Button>
          </div>
        </div>

        {/* Métricas principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">38 ativos hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livros / Capítulos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342 / 1.257</div>
              <p className="text-xs text-muted-foreground">Produção total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uso de IA</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.417</div>
              <p className="text-xs text-muted-foreground">Sessões no total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 3.480</div>
              <p className="text-xs text-muted-foreground">85 assinaturas ativas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabelas rápidas */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Usuários mais ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { email: "maria@exemplo.com", livros: 6, sessoesIA: 32 },
                { email: "joao@exemplo.com", livros: 4, sessoesIA: 25 },
                { email: "ana@exemplo.com", livros: 5, sessoesIA: 18 },
              ].map((u) => (
                <div key={u.email} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{u.email}</span>
                  <span className="text-muted-foreground">{u.livros} livros • {u.sessoesIA} IA</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">[!] Atividade anômala: 1.500 sessões de IA em 24h (joao@exemplo.com)</div>
              <div className="text-sm">[!] 3 falhas de conexão com Supabase hoje</div>
              <div className="text-sm">[i] Renovação de faturas em 3 dias</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
