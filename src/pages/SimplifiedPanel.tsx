import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SimplifiedBookList } from '@/components/Books/SimplifiedBookList'
import { Plus, Settings, BookOpen } from 'lucide-react'

const SimplifiedPanel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Painel de Escrita</h1>
          <p className="text-muted-foreground mt-2">Acesso rápido às suas criações</p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Criar Livro */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Livro
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Inicie um novo projeto de escrita</p>
            <Link to="/create-book" onClick={() => sessionStorage.setItem('fromSimplified', 'true')}>
              <Button size="lg" className="w-full">
                Novo Livro
              </Button>
            </Link>
            </CardContent>
          </Card>

          {/* Dashboard Avançado */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Settings className="h-5 w-5" />
                Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Configurações avançadas do livro</p>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="w-full">
                  Acessar Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Meus Livros */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Livros</CardTitle>
            <p className="text-muted-foreground text-sm">
              Clique em um livro para acessar seus capítulos
            </p>
          </CardHeader>
          <CardContent>
            <SimplifiedBookList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SimplifiedPanel