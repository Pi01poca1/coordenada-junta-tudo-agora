import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/Layout/Navigation'
import { DraggableChapterList } from '@/components/Chapters/DraggableChapterList'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Edit, Calendar, Clock } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ExportPanel } from '@/components/Export/ExportPanel'

interface Book {
  id: string
  title: string
  status: string
  created_at: string
  updated_at: string
}

const BookDetails = () => {
  const [book, setBook] = useState<Book | null>(null)
  const [chapterCount, setChapterCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      fetchBook(id)
    }
  }, [id, user])

  const fetchBook = async (bookId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .eq('owner_id', user.id)
        .single()

      if (error) throw error
      setBook(data)

      // Fetch chapter count
      const { count, error: countError } = await supabase
        .from('chapters')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', bookId)

      if (!countError) {
        setChapterCount(count || 0)
      }
    } catch (error) {
      console.error('Error fetching book:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar livro ou livro não encontrado',
        variant: 'destructive',
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-muted-foreground">Carregando livro...</div>
          </div>
        </main>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Livro não encontrado</h1>
            <Link to="/dashboard">
              <Button>Voltar ao Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800',
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-1">
            {/* Book Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2 text-xl">{book.title}</CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(book.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDistanceToNow(new Date(book.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      statusColors[book.status as keyof typeof statusColors] || statusColors.draft
                    }
                  >
                    {book.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={`/books/${book.id}/edit`}>
                  <Button className="w-full" variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Livro
                  </Button>
                </Link>
              </CardContent>
            </Card>


            {/* Export Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📄 Exportar Livro</CardTitle>
                <CardDescription>Baixe seu livro em diferentes formatos</CardDescription>
              </CardHeader>
              <CardContent>
                <ExportPanel bookId={book.id} bookTitle={book.title} totalChapters={chapterCount} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <DraggableChapterList bookId={book.id} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default BookDetails
