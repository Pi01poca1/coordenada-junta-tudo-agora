import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { getAlignmentClass, TextAlignment } from '@/components/ui/alignment-controls'
import { Plus, Edit, Trash2, FileText, Eye, GripVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Chapter {
  id: string
  title: string
  content: string | null
  order_index: number | null
  created_at: string
  updated_at: string
  book_id: string
}

interface SortableChapterProps {
  chapter: Chapter
  index: number
  bookId: string
  titleAlignment?: TextAlignment
}

const SortableChapter = ({ chapter, index, bookId, titleAlignment = 'left' }: SortableChapterProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all ${isDragging ? 'scale-105 shadow-lg' : ''}`}
    >
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div
          className="mr-3 flex cursor-grab items-center rounded p-1 hover:bg-muted active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <CardTitle className={`text-lg ${getAlignmentClass(titleAlignment)}`}>{chapter.title}</CardTitle>
          <CardDescription>
            {chapter.content
              ? `${chapter.content.substring(0, 100)}${chapter.content.length > 100 ? '...' : ''}`
              : 'Sem conteúdo ainda'}
          </CardDescription>
        </div>
        <Badge variant="outline" className="ml-2">
          #{chapter.order_index || 0}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Atualizado {formatDistanceToNow(new Date(chapter.updated_at), { addSuffix: true })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/books/${bookId}/chapters/${chapter.id}`}>
                <Eye className="mr-1 h-4 w-4" />
                Ver
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/books/${bookId}/chapters/${chapter.id}/edit`}>
                <Edit className="mr-1 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DraggableChapterListProps {
  bookId?: string
  titleAlignment?: TextAlignment
  onChaptersReordered?: () => void
}

export const DraggableChapterList = ({ bookId: propBookId, titleAlignment = 'left', onChaptersReordered }: DraggableChapterListProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const { bookId: paramBookId } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const bookId = propBookId || paramBookId

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchChapters = async () => {
    if (!bookId || !user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setChapters(data || [])
    } catch (error) {
      console.error('Erro ao carregar capítulos:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar capítulos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChapters()
  }, [bookId, user])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      console.log('🔄 Drag and drop iniciado:', { 
        active: active.id, 
        over: over?.id,
        activeType: typeof active.id,
        overType: typeof over?.id 
      })
      
      const oldIndex = chapters.findIndex((chapter) => chapter.id === active.id)
      const newIndex = chapters.findIndex((chapter) => chapter.id === over?.id)
      
      console.log('📊 Índices encontrados:', { oldIndex, newIndex })
      console.log('📋 Capítulos antes da reordenação:', chapters.map(c => ({ id: c.id, title: c.title, order: c.order_index })))

      const newChapters = arrayMove(chapters, oldIndex, newIndex)
      console.log('📋 Capítulos após reordenação local:', newChapters.map(c => ({ id: c.id, title: c.title, order: c.order_index })))
      
      setChapters(newChapters)

      // Atualizar order_index no banco
      try {
        console.log('💾 Salvando nova ordem dos capítulos...')
        const updates = newChapters.map((chapter, index) => ({
          id: chapter.id,
          order_index: index + 1,
        }))

        console.log('📝 Updates a serem aplicados:', updates)

        for (const update of updates) {
          console.log(`🔄 Atualizando capítulo ${update.id} para order_index ${update.order_index}`)
          
          const { error: updateError } = await supabase
            .from('chapters')
            .update({ order_index: update.order_index })
            .eq('id', update.id)
            
          if (updateError) {
            console.error(`❌ Erro ao atualizar capítulo ${update.id}:`, updateError)
            throw updateError
          }
          
          console.log(`✅ Capítulo ${update.id} atualizado com sucesso`)
        }

        console.log('✅ Todas as atualizações concluídas')

        // Notificar que a ordem foi alterada ANTES do toast
        if (onChaptersReordered) {
          console.log('📢 Chamando callback de reordenação...')
          onChaptersReordered()
        }

        toast({
          title: 'Sucesso',
          description: 'Ordem dos capítulos atualizada e sumário atualizado',
        })
      } catch (error) {
        console.error('💥 Erro ao atualizar ordem dos capítulos:', error)
        
        // Log detalhado do erro
        if (error.message) {
          console.error('📋 Mensagem do erro:', error.message)
        }
        if (error.details) {
          console.error('📋 Detalhes do erro:', error.details)
        }
        if (error.hint) {
          console.error('📋 Dica do erro:', error.hint)
        }
        
        toast({
          title: 'Erro',
          description: `Falha ao salvar nova ordem: ${error.message || 'Erro desconhecido'}`,
          variant: 'destructive',
        })
        // Reverter mudança local
        console.log('🔄 Revertendo mudanças locais...')
        fetchChapters()
      }
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Carregando capítulos...</div>
  }

  if (!chapters.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <FileText className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">Nenhum capítulo encontrado</p>
          <Button asChild>
            <Link to={`/books/${bookId}/chapters/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Capítulo
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Capítulos</h2>
        <Button asChild>
          <Link to={`/books/${bookId}/chapters/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Capítulo
          </Link>
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <SortableChapter
                key={chapter.id}
                chapter={chapter}
                index={index}
                bookId={bookId!}
                titleAlignment={titleAlignment}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
