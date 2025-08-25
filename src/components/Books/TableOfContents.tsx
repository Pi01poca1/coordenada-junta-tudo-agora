import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { getAlignmentClass, TextAlignment } from '@/components/ui/alignment-controls'
import { 
  BookOpen, 
  FileText, 
  Heart, 
  Award, 
  Users, 
  Quote, 
  Edit,
  GripVertical,
  RefreshCw,
  ChevronRight
} from 'lucide-react'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Chapter {
  id: string
  title: string
  order_index: number
  content: string | null
}

interface BookElement {
  id: string
  type: string
  title: string
  order_index: number
  enabled: boolean
}

interface TOCItem {
  id: string
  title: string
  type: 'chapter' | 'element'
  pageNumber: number
  order: number
  enabled?: boolean
}

interface SortableTOCItemProps {
  item: TOCItem
  index: number
  totalItems: TOCItem[]
  onEdit?: (item: TOCItem) => void
  titleAlignment?: TextAlignment
}

const SortableTOCItem = ({ item, index, totalItems, onEdit, titleAlignment = 'left' }: SortableTOCItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${item.type}-${item.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = item.type === 'chapter' 
    ? FileText 
    : elementIcons[item.type as keyof typeof elementIcons] || FileText

  return (
    <div key={`${item.type}-${item.id}`}>
      {index > 0 && totalItems[index - 1].type !== item.type && (
        <div className="my-6">
          <Separator className="mb-4" />
          <h4 className="text-sm font-semibold text-foreground/80 mb-2">
            {item.type === 'chapter' ? 'CAPÍTULOS' : 'ELEMENTOS PROFISSIONAIS'}
          </h4>
        </div>
      )}
      <div 
        ref={setNodeRef}
        style={style}
        className={`group relative bg-card border border-border/50 rounded-xl p-6 transition-all duration-200 ${
          item.enabled === false 
            ? 'opacity-60 bg-muted/20' 
            : 'hover:border-primary/20 hover:shadow-md hover:bg-card/80'
        }`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/80"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-start justify-between ml-8">
          {/* Content Section */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${
              item.type === 'chapter' 
                ? 'bg-primary/10 text-primary' 
                : 'bg-secondary/10 text-secondary-foreground'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className={`text-lg font-semibold text-foreground leading-tight ${getAlignmentClass(titleAlignment)}`}>
                  {item.title}
                </h3>
                {item.enabled === false && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    Desabilitado
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Badge 
                  variant={item.type === 'chapter' ? 'default' : 'secondary'}
                  className="text-xs font-medium px-3 py-1"
                >
                  {item.type === 'chapter' ? 'Capítulo' : 'Elemento Profissional'}
                </Badge>
                
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="h-7 px-3 text-xs hover:bg-muted/80"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Page Number Section */}
          <div className="flex items-center gap-2 text-right">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {item.pageNumber}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                página
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface TableOfContentsProps {
  bookId: string
  titleAlignment?: TextAlignment
}

interface TableOfContentsRef {
  refreshTOC: () => Promise<void>
}

const elementIcons = {
  cover: BookOpen,
  dedication: Heart,
  acknowledgments: Users,
  preface: Quote,
  summary: FileText,
  introduction: FileText,
  epilogue: FileText,
  about_author: Award,
  bibliography: BookOpen,
  chapter: FileText,
}

export const TableOfContents = forwardRef<TableOfContentsRef, TableOfContentsProps>(
  ({ bookId, titleAlignment = 'left' }, ref) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (bookId) {
      const loadTOC = async () => {
        try {
          await generateTOC()
        } catch (error) {
          console.error('Error loading TOC:', error)
        }
      }
      loadTOC()

      // Listener para atualização automática quando capítulos ou elementos mudam
      const handleChaptersReordered = async (event: CustomEvent) => {
        if (event.detail.bookId === bookId) {
          setTimeout(() => {
            generateTOC()
          }, 500)
        }
      }

      const handleElementsUpdated = async (event: CustomEvent) => {
        if (event.detail.bookId === bookId) {
          setTimeout(() => {
            generateTOC()
          }, 500)
        }
      }

      const handleChapterUpdated = () => {
        setTimeout(() => {
          generateTOC()
        }, 300)
      }

      // Adicionar listeners para eventos customizados
      window.addEventListener('chaptersReordered', handleChaptersReordered as EventListener)
      window.addEventListener('elementsUpdated', handleElementsUpdated as EventListener)
      window.addEventListener('chapterUpdated', handleChapterUpdated)
      window.addEventListener('chapterCreated', handleChapterUpdated)
      window.addEventListener('chapterDeleted', handleChapterUpdated)

      return () => {
        window.removeEventListener('chaptersReordered', handleChaptersReordered as EventListener)
        window.removeEventListener('elementsUpdated', handleElementsUpdated as EventListener)
        window.removeEventListener('chapterUpdated', handleChapterUpdated)
        window.removeEventListener('chapterCreated', handleChapterUpdated)
        window.removeEventListener('chapterDeleted', handleChapterUpdated)
      }
    }
  }, [bookId])

  const generateTOC = async () => {
    setLoading(true)
    try {
      // Fetch chapters
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('id, title, order_index, content')
        .eq('book_id', bookId)
        .order('order_index')

      if (chaptersError) throw chaptersError

      // Fetch book elements - handle case where table doesn't exist yet
      let elements: BookElement[] = []
      try {
        const { data: elementsData, error: elementsError } = await supabase
          .from('book_elements')
          .select('id, type, title, order_index, enabled')
          .eq('book_id', bookId)
          .order('order_index')

        if (elementsError && elementsError.code !== 'PGRST116') {
          throw elementsError
        }
        elements = elementsData || []
      } catch (error) {
        // Table might not exist yet, that's ok
        console.log('Book elements table not available yet')
      }

      // Generate table of contents with page calculations
      const items: TOCItem[] = []
      let currentPage = 1

      // Add enabled elements first (they come before chapters)
      const enabledElements = elements.filter(el => el.enabled)
      for (const element of enabledElements) {
        items.push({
          id: element.id,
          title: element.title,
          type: 'element',
          pageNumber: currentPage,
          order: element.order_index,
          enabled: element.enabled,
        })
        // Each element takes approximately 1-2 pages
        currentPage += 2
      }

      // Add chapters
      if (chapters) {
        for (let i = 0; i < chapters.length; i++) {
          const chapter = chapters[i]
          const wordCount = chapter.content ? chapter.content.split(' ').length : 0
          const estimatedPages = Math.max(1, Math.ceil(wordCount / 300)) // ~300 words per page
          
          items.push({
            id: chapter.id,
            title: chapter.title,
            type: 'chapter',
            pageNumber: currentPage,
            order: chapter.order_index || i + 1,
          })
          
          currentPage += estimatedPages
        }
      }

      setTocItems(items)
    } catch (error) {
      console.error('Error generating TOC:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao gerar sumário',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshTOC = async () => {
    setUpdating(true)
    await generateTOC()
    setUpdating(false)
    toast({
      title: 'Sumário Atualizado',
      description: 'O sumário foi regenerado com as últimas alterações',
    })
  }

  useImperativeHandle(ref, () => ({
    refreshTOC,
  }))

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = tocItems.findIndex((item) => `${item.type}-${item.id}` === active.id)
      const newIndex = tocItems.findIndex((item) => `${item.type}-${item.id}` === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTocItems = arrayMove(tocItems, oldIndex, newIndex)
        setTocItems(newTocItems)

        // Update order in database for elements and chapters separately
        try {
          const elementsToUpdate = newTocItems
            .filter(item => item.type === 'element')
            .map((item, index) => ({ id: item.id, order_index: index + 1 }))

          const chaptersToUpdate = newTocItems
            .filter(item => item.type === 'chapter')
            .map((item, index) => ({ id: item.id, order_index: index + 1 }))

          // Update elements
          for (const element of elementsToUpdate) {
            await supabase
              .from('book_elements')
              .update({ order_index: element.order_index })
              .eq('id', element.id)
          }

          // Update chapters
          for (const chapter of chaptersToUpdate) {
            await supabase
              .from('chapters')
              .update({ order_index: chapter.order_index })
              .eq('id', chapter.id)
          }

          toast({
            title: 'Ordem atualizada',
            description: 'A ordem do sumário foi alterada com sucesso',
          })

          // Refresh TOC to recalculate page numbers
          await generateTOC()
          
          // Emitir evento para outras partes da aplicação
          window.dispatchEvent(new CustomEvent('tocUpdated', { 
            detail: { bookId } 
          }))
        } catch (error) {
          console.error('Error updating order:', error)
          toast({
            title: 'Erro',
            description: 'Falha ao atualizar ordem do sumário',
            variant: 'destructive',
          })
        }
      }
    }
  }

  const handleEditItem = (item: TOCItem) => {
    if (item.type === 'chapter') {
      // Navigate to chapter edit page using React Router
      navigate(`/books/${bookId}/chapters/${item.id}/edit`)
    } else {
      // For elements, we'll emit an event that the parent can listen to
      toast({
        title: 'Editar Elemento',
        description: 'Clique no elemento na seção "Elementos Profissionais" para editá-lo',
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sumário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Gerando sumário...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sumário Dinâmico
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTOC}
            disabled={updating}
          >
            <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tocItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>Nenhum conteúdo para o sumário</p>
            <p className="text-sm">Adicione capítulos e elementos profissionais</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tocItems.map(item => `${item.type}-${item.id}`)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {tocItems.map((item, index) => (
                  <SortableTOCItem
                    key={`${item.type}-${item.id}`}
                    item={item}
                    index={index}
                    totalItems={tocItems}
                    onEdit={handleEditItem}
                    titleAlignment={titleAlignment}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        
        <Separator />
        
        <div className="text-xs text-muted-foreground text-center">
          <p>📄 Total estimado: {tocItems.length > 0 ? Math.max(...tocItems.map(i => i.pageNumber)) + 1 : 0} páginas</p>
          <p className="mt-1">
            ℹ️ O sumário é atualizado automaticamente quando você adiciona/remove conteúdo
          </p>
        </div>
      </CardContent>
    </Card>
  )
})