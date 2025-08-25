import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/Layout/Navigation'
import { ImageRenderer } from '@/components/Images/ImageRenderer'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Edit, Calendar, Clock } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Chapter {
  id: string
  title: string
  content: string | null
  order_index: number | null
  created_at: string
  updated_at: string
  book_id: string
}

interface Book {
  id: string
  title: string
}

const ChapterDetail = () => {
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const { bookId, chapterId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (bookId && chapterId) {
      fetchChapterAndBook()
    }
  }, [bookId, chapterId, user])

  const fetchChapterAndBook = async () => {
    if (!user || !bookId || !chapterId) return

    try {
      // Fetch chapter
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .eq('book_id', bookId)
        .single()

      if (chapterError) throw chapterError

      // Fetch book
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('id, title')
        .eq('id', bookId)
        .eq('owner_id', user.id)
        .single()

      if (bookError) throw bookError

      setChapter(chapterData)
      setBook(bookData)
    } catch (error) {
      console.error('Error fetching chapter or book:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar capítulo ou acesso não autorizado',
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
            <div className="text-muted-foreground">Carregando capítulo...</div>
          </div>
        </main>
      </div>
    )
  }

  if (!chapter || !book) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Capítulo não encontrado</h1>
            <Link to="/dashboard">
              <Button>Voltar ao Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/books/${bookId}`)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar a {book.title}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <Badge variant="outline">Capítulo {chapter.order_index || 1}</Badge>
                    </div>
                    <CardTitle className="mb-2 text-2xl">{chapter.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(new Date(chapter.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {formatDistanceToNow(new Date(chapter.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Link to={`/books/${bookId}/chapters/${chapterId}/edit`}>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" variant="default">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Capítulo
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              {chapter.content && (
                <CardContent>
                  <div className="prose max-w-none">
                    {/* Renderizar imagens posicionadas */}
                    <ImageRenderer chapterId={chapterId} />

                    {/* Conteúdo do texto */}
                    {chapter.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Capítulo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Livro</div>
                  <div className="text-sm">{book.title}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Ordem</div>
                  <div className="text-sm">Capítulo {chapter.order_index || 1}</div>
                </div>
                {chapter.content && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Tempo estimado de leitura
                    </div>
                    <div className="text-sm">{Math.ceil(chapter.content.length / 250)} minutos</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChapterDetail
