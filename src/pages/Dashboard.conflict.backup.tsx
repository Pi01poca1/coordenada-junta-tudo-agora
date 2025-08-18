<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Layout/Navigation';
import { BookList } from '@/components/Books/BookList';
import { SupabaseTest } from '@/components/Debug/SupabaseTest';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, FileText, BarChart3, Clock, TrendingUp } from 'lucide-react';
=======
﻿import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/Layout/Navigation'
import { BookList } from '@/components/Books/BookList'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Plus, BookOpen, FileText, BarChart3, Clock, TrendingUp } from 'lucide-react'
>>>>>>> a8e8a7e (feat: ajustes no fluxo de login, admin dashboard e policies supabase)

interface DashboardStats {
  totalBooks: number
  totalChapters: number
  totalWords: number
  recentActivity: number
  booksThisMonth: number
  chaptersThisMonth: number
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalChapters: 0,
    totalWords: 0,
    recentActivity: 0,
    booksThisMonth: 0,
    chaptersThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      // Total books
      const { count: totalBooks } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)

      // Total chapters
      const { count: totalChapters } = await supabase
        .from('chapters')
        .select('chapters.*, books!inner(owner_id)', { count: 'exact', head: true })
        .eq('books.owner_id', user.id)

      // Books this month
      const { count: booksThisMonth } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .gte('created_at', startOfMonth.toISOString())

      // Chapters this month
      const { count: chaptersThisMonth } = await supabase
        .from('chapters')
        .select('chapters.*, books!inner(owner_id)', { count: 'exact', head: true })
        .eq('books.owner_id', user.id)
        .gte('chapters.created_at', startOfMonth.toISOString())

      // Total words (estimate from content length)
      const { data: chaptersWithContent } = await supabase
        .from('chapters')
        .select('content, books!inner(owner_id)')
        .eq('books.owner_id', user.id)
        .not('content', 'is', null)

      const totalWords =
        chaptersWithContent?.reduce((total, chapter) => {
          return total + (chapter.content?.split(/\s+/).length || 0)
        }, 0) || 0

      // Recent activity (chapters updated in last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { count: recentActivity } = await supabase
        .from('chapters')
        .select('chapters.*, books!inner(owner_id)', { count: 'exact', head: true })
        .eq('books.owner_id', user.id)
        .gte('chapters.updated_at', sevenDaysAgo.toISOString())

      setStats({
        totalBooks: totalBooks || 0,
        totalChapters: totalChapters || 0,
        totalWords,
        recentActivity: recentActivity || 0,
        booksThisMonth: booksThisMonth || 0,
        chaptersThisMonth: chaptersThisMonth || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar estatísticas do dashboard',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Gerencie seus livros e acompanhe seu progresso de escrita
            </p>
          </div>
        </div>

        {/* Supabase Connection Test */}
        <div className="mb-6">
          <SupabaseTest />
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Livros</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalBooks}</div>
              <p className="text-xs text-muted-foreground">+{stats.booksThisMonth} este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Capítulos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalChapters}</div>
              <p className="text-xs text-muted-foreground">+{stats.chaptersThisMonth} este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Palavras</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalWords.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Em todos os Capítulos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground">Capítulos atualizados (7 dias)</p>
            </CardContent>
          </Card>
        </div>

        {/* Books List */}
        <BookList />
      </main>
    </div>
  )
}

export default Dashboard
