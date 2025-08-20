import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, FileText, Heart, Award, Users, Quote, Edit, GripVertical } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { BookElementEditor } from './BookElementEditor'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface BookElement {
  id: string
  type: 'cover' | 'dedication' | 'acknowledgments' | 'preface' | 'summary' | 'introduction' | 'epilogue' | 'about_author' | 'bibliography'
  title: string
  content: string | null
  order_index: number
  enabled: boolean
  book_id: string
  created_at: string
  updated_at: string
}

interface BookElementsManagerProps {
  bookId: string
}

const elementTypes = {
  cover: { icon: BookOpen, label: 'Capa', description: 'Capa do livro' },
  dedication: { icon: Heart, label: 'Dedicatória', description: 'Mensagem de dedicação' },
  acknowledgments: { icon: Users, label: 'Agradecimentos', description: 'Reconhecimentos e gratidão' },
  preface: { icon: Quote, label: 'Prefácio', description: 'Introdução preliminar' },
  summary: { icon: FileText, label: 'Resumo', description: 'Síntese do conteúdo' },
  introduction: { icon: FileText, label: 'Introdução', description: 'Apresentação inicial' },
  epilogue: { icon: FileText, label: 'Epílogo', description: 'Conclusão final' },
  about_author: { icon: Award, label: 'Sobre o Autor', description: 'Biografia do autor' },
  bibliography: { icon: BookOpen, label: 'Bibliografia', description: 'Referências bibliográficas' },
}

interface SortableElementProps {
  element: BookElement
  onEdit: (element: BookElement) => void
  onToggle: (id: string, enabled: boolean) => void
}

const SortableElement = ({ element, onEdit, onToggle }: SortableElementProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const ElementIcon = elementTypes[element.type]?.icon || FileText

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded-lg bg-background"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <ElementIcon className="h-4 w-4" />
        <div className="flex-1">
          <div className="font-medium">{element.title}</div>
          <div className="text-xs text-muted-foreground">
            {elementTypes[element.type]?.description}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(element)}
          className="h-8"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Badge variant={element.enabled ? "default" : "secondary"}>
          {element.enabled ? "Ativo" : "Inativo"}
        </Badge>
        <Checkbox
          checked={element.enabled}
          onCheckedChange={(checked) =>
            onToggle(element.id, checked as boolean)
          }
        />
      </div>
    </div>
  )
}

export const BookElementsManager = ({ bookId }: BookElementsManagerProps) => {
  const [elements, setElements] = useState<BookElement[]>([])
  const [editingElement, setEditingElement] = useState<BookElement | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (bookId) {
      fetchElements()
    }
  }, [bookId])

  const fetchElements = async () => {
    try {
      const { data, error } = await supabase
        .from('book_elements')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index')

      if (error) throw error
      setElements(data || [])
    } catch (error) {
      console.error('Error fetching book elements:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar elementos do livro',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const createElement = async (type: keyof typeof elementTypes) => {
    if (!user) return

    try {
      const orderIndex = elements.length + 1
      const { data, error } = await supabase
        .from('book_elements')
        .insert({
          book_id: bookId,
          type,
          title: elementTypes[type].label,
          content: '',
          order_index: orderIndex,
          enabled: true,
        })
        .select()
        .single()

      if (error) throw error

      setElements(prev => [...prev, data])
      toast({
        title: 'Sucesso',
        description: `${elementTypes[type].label} adicionado com sucesso`,
      })
    } catch (error) {
      console.error('Error creating element:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao criar elemento',
        variant: 'destructive',
      })
    }
  }

  const toggleElement = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('book_elements')
        .update({ enabled })
        .eq('id', id)

      if (error) throw error

      setElements(prev =>
        prev.map(el => (el.id === id ? { ...el, enabled } : el))
      )
    } catch (error) {
      console.error('Error toggling element:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar elemento',
        variant: 'destructive',
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = elements.findIndex((item) => item.id === active.id)
      const newIndex = elements.findIndex((item) => item.id === over?.id)

      const newElements = arrayMove(elements, oldIndex, newIndex)
      
      // Update order_index for each element
      const updatedElements = newElements.map((element, index) => ({
        ...element,
        order_index: index + 1
      }))
      
      setElements(updatedElements)

      // Update order in database
      try {
        for (const element of updatedElements) {
          await supabase
            .from('book_elements')
            .update({ order_index: element.order_index })
            .eq('id', element.id)
        }
        
        toast({
          title: 'Ordem atualizada',
          description: 'A ordem dos elementos foi alterada com sucesso',
        })
      } catch (error) {
        console.error('Error updating order:', error)
        toast({
          title: 'Erro',
          description: 'Falha ao atualizar ordem dos elementos',
          variant: 'destructive',
        })
      }
    }
  }

  const handleEditElement = (element: BookElement) => {
    setEditingElement(element)
  }

  const handleUpdateElement = (updatedElement: BookElement) => {
    setElements(prev =>
      prev.map(el => (el.id === updatedElement.id ? updatedElement : el))
    )
    setEditingElement(null)
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Carregando elementos...</div>
  }

  if (editingElement) {
    return (
      <BookElementEditor
        element={editingElement}
        onClose={() => setEditingElement(null)}
        onUpdate={handleUpdateElement}
      />
    )
  }

  const existingTypes = elements.map(el => el.type)
  const availableTypes = Object.keys(elementTypes).filter(
    type => !existingTypes.includes(type as keyof typeof elementTypes)
  ) as (keyof typeof elementTypes)[]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Elementos Profissionais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Elements */}
        {elements.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Elementos Configurados</Label>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={elements.map(el => el.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {elements.map(element => (
                    <SortableElement
                      key={element.id}
                      element={element}
                      onEdit={handleEditElement}
                      onToggle={toggleElement}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Available Elements to Add */}
        {availableTypes.length > 0 && (
          <>
            {elements.length > 0 && <Separator />}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Adicionar Elementos</Label>
              <div className="grid grid-cols-1 gap-2">
                {availableTypes.map(type => {
                  const ElementIcon = elementTypes[type].icon
                  return (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      className="justify-start h-16 p-4"
                      onClick={() => createElement(type)}
                    >
                      <ElementIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{elementTypes[type].label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {elementTypes[type].description}
                        </div>
                      </div>
                      <Plus className="ml-3 h-4 w-4 flex-shrink-0" />
                    </Button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {elements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>Nenhum elemento profissional adicionado ainda</p>
            <p className="text-sm">Adicione elementos como prefácio, dedicatória, etc.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
