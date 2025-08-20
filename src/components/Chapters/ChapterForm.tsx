import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save } from 'lucide-react'


export const ChapterForm = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [orderIndex, setOrderIndex] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [book, setBook] = useState<any>(null)
  const [chapter, setChapter] = useState<any>(null)

  const { bookId, chapterId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (!bookId || bookId === 'undefined') {
      toast({
        title: 'Erro',
        description: 'ID do livro inválido. Redirecionando...',
        variant: 'destructive',
      })
      navigate('/dashboard')
      return
    }

    if (chapterId && chapterId !== 'new') {
      setIsEdit(true)
      fetchChapter(chapterId)
    } else {
      fetchNextOrderIndex()
    }

    fetchBook()
  }, [chapterId, bookId, navigate, toast])

  const fetchBook = async () => {
    if (!bookId) return

    try {
      const { data, error } = await supabase.from('books').select('*').eq('id', bookId).single()

      if (error) throw error
      setBook(data)
    } catch (error) {
      console.error('Error fetching book:', error)
    }
  }

  const fetchChapter = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .eq('book_id', bookId)
        .single()

      if (error) throw error

      if (data) {
        setChapter(data)
        setTitle(data.title)
        setContent(data.content || '')
        setOrderIndex(data.order_index || 1)
      }
    } catch (error) {
      console.error('Error fetching chapter:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar capítulo',
        variant: 'destructive',
      })
      navigate(`/books/${bookId}`)
    }
  }


  const fetchNextOrderIndex = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('order_index')
        .eq('book_id', bookId)
        .order('order_index', { ascending: false })
        .limit(1)

      if (error) throw error

      const lastOrder = data?.[0]?.order_index || 0
      setOrderIndex(lastOrder + 1)
    } catch (error) {
      console.error('Error fetching order index:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !bookId) return

    setLoading(true)

    try {
      if (isEdit && chapterId) {
        const { error } = await supabase
          .from('chapters')
          .update({
            title,
            content,
            order_index: orderIndex,
            updated_at: new Date().toISOString(),
          })
          .eq('id', chapterId)
          .eq('book_id', bookId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('chapters').insert({
          title,
          content,
          order_index: orderIndex,
          book_id: bookId,
          author_id: user.id,
        })

        if (error) throw error
      }

      toast({
        title: 'Sucesso',
        description: `Capítulo ${isEdit ? 'atualizado' : 'criado'} com sucesso`,
      })

      navigate(`/books/${bookId}`)
    } catch (error) {
      console.error('Error saving chapter:', error)
      toast({
        title: 'Erro',
        description: `Falha ao ${isEdit ? 'atualizar' : 'criar'} capítulo`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/books/${bookId}`)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Livro
        </Button>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{isEdit ? 'Editar Capítulo' : 'Novo Capítulo'}</h1>
          {isEdit && chapter && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Editando:</span>
              <span className="font-medium">{chapter.title}</span>
              <span>•</span>
              <span>Capítulo {chapter.order_index}</span>
            </div>
          )}
          {book && (
            <div className="text-sm text-muted-foreground">
              Livro: <span className="font-medium">{book.title}</span>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar Capítulo' : 'Detalhes do Capítulo'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Atualize o conteúdo do seu capítulo' : 'Escreva seu novo capítulo'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Título do Capítulo *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Digite o título do capítulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Ordem do Capítulo</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Comece a escrever seu capítulo..."
                rows={20}
                className="min-h-[400px] font-serif text-base leading-relaxed"
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Salvando...' : isEdit ? 'Atualizar Capítulo' : 'Criar Capítulo'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/books/${bookId}`)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
