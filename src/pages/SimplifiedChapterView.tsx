import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Plus, Edit, Eye, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

const SimplifiedChapterView = () => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const { bookId } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (bookId && user) {
      fetchBookAndChapters()
    }
  }, [bookId, user])

  const fetchBookAndChapters = async () => {
    if (!user || !bookId) return

    try {
      // Fetch book details
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .eq('owner_id', user.id)
        .single()

      if (bookError) throw bookError
      setBook(bookData)

      // Fetch chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true })

      if (chaptersError) throw chaptersError
      setChapters(chaptersData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-muted-foreground">Carregando capítulos...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header with Return Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/simplified">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Painel
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{book?.title}</h1>
              <p className="text-muted-foreground">Capítulos do livro</p>
            </div>
          </div>
              <Link to={`/books/${bookId}/chapters/new`} onClick={() => sessionStorage.setItem('fromSimplified', 'true')}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Capítulo
                </Button>
              </Link>
        </div>

        {/* Chapters List */}
        <Card>
          <CardHeader>
            <CardTitle>Capítulos</CardTitle>
          </CardHeader>
          <CardContent>
            {chapters.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">Nenhum capítulo ainda</h3>
                <p className="mb-4 text-muted-foreground">
                  Comece escrevendo o primeiro capítulo do seu livro
                </p>
                <Link to={`/books/${bookId}/chapters/new`} onClick={() => sessionStorage.setItem('fromSimplified', 'true')}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Capítulo
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Capítulo {chapter.order_index || index + 1}
                            </Badge>
                            <h3 className="font-medium">{chapter.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Última atualização{' '}
                            {formatDistanceToNow(new Date(chapter.updated_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                            {chapter.content && (
                              <span className="ml-2">
                                • {Math.ceil(chapter.content.length / 250)} min de leitura
                              </span>
                            )}
                          </p>
                          {chapter.content && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {chapter.content.substring(0, 150)}...
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Link to={`/books/${bookId}/chapters/${chapter.id}`} onClick={() => sessionStorage.setItem('fromSimplified', 'true')}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/books/${bookId}/chapters/${chapter.id}/edit`} onClick={() => sessionStorage.setItem('fromSimplified', 'true')}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SimplifiedChapterView