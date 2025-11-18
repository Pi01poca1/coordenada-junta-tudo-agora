import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { BookEditorToolbar } from '@/components/BookEditor/BookEditorToolbar'
import { BookEditorStructure } from '@/components/BookEditor/BookEditorStructure'
import { BookPageRenderer } from '@/components/BookEditor/BookPageRenderer'
import { BookPageEffect } from '@/components/BookEditor/BookPageEffect'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export interface BookElement {
  id: string
  type: string
  title: string
  content: string | null
  order_index: number
  enabled: boolean
  book_id: string
}

export interface Chapter {
  id: string
  title: string
  content: string | null
  order_index: number
  book_id: string
  author_id: string
}

export type BookItem = 
  | { type: 'element'; data: BookElement }
  | { type: 'chapter'; data: Chapter }

const BookEditor = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [book, setBook] = useState<any>(null)
  const [items, setItems] = useState<BookItem[]>([])
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Panel states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  // Typography settings
  const [fontFamily, setFontFamily] = useState('serif')
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [useABNT, setUseABNT] = useState(false)

  useEffect(() => {
    if (bookId && user) {
      loadBookData()
    }
  }, [bookId, user])

  const loadBookData = async () => {
    try {
      setLoading(true)

      // Load book
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      if (bookError) throw bookError
      setBook(bookData)

      // Load elements
      const { data: elementsData, error: elementsError } = await supabase
        .from('book_elements')
        .select('*')
        .eq('book_id', bookId)
        .eq('enabled', true)
        .order('order_index')

      if (elementsError) throw elementsError

      // Load chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index')

      if (chaptersError) throw chaptersError

      // Combine and sort
      const combined: BookItem[] = [
        ...(elementsData || []).map(el => ({ type: 'element' as const, data: el })),
        ...(chaptersData || []).map(ch => ({ type: 'chapter' as const, data: ch }))
      ].sort((a, b) => a.data.order_index - b.data.order_index)

      setItems(combined)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar livro')
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentItemIndex(index)
    }
  }

  const handleAddChapter = async () => {
    if (!bookId || !user) return

    try {
      const newOrderIndex = items.length > 0 
        ? Math.max(...items.map(i => i.data.order_index)) + 1 
        : 0

      const { data, error } = await supabase
        .from('chapters')
        .insert({
          book_id: bookId,
          author_id: user.id,
          title: 'Novo Capítulo',
          content: '',
          order_index: newOrderIndex
        })
        .select()
        .single()

      if (error) throw error

      const newChapter: BookItem = {
        type: 'chapter',
        data: data
      }

      setItems([...items, newChapter])
      setCurrentItemIndex(items.length)
      toast.success('Capítulo adicionado')
    } catch (error) {
      console.error('Erro ao adicionar capítulo:', error)
      toast.error('Erro ao adicionar capítulo')
    }
  }

  const handleUpdateContent = async (content: string) => {
    const currentItem = items[currentItemIndex]
    if (!currentItem) return

    try {
      if (currentItem.type === 'chapter') {
        const { error } = await supabase
          .from('chapters')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', currentItem.data.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('book_elements')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', currentItem.data.id)

        if (error) throw error
      }

      // Update local state
      const newItems = [...items]
      newItems[currentItemIndex].data.content = content
      setItems(newItems)

      toast.success('Salvo automaticamente')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar')
    }
  }

  const handleUpdateTitle = async (title: string) => {
    const currentItem = items[currentItemIndex]
    if (!currentItem) return

    try {
      if (currentItem.type === 'chapter') {
        const { error } = await supabase
          .from('chapters')
          .update({ title })
          .eq('id', currentItem.data.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('book_elements')
          .update({ title })
          .eq('id', currentItem.data.id)

        if (error) throw error
      }

      // Update local state
      const newItems = [...items]
      newItems[currentItemIndex].data.title = title
      setItems(newItems)
    } catch (error) {
      console.error('Erro ao atualizar título:', error)
      toast.error('Erro ao atualizar título')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seu livro...</p>
        </div>
      </div>
    )
  }

  const currentItem = items[currentItemIndex]

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-lg font-semibold">{book?.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          >
            {leftPanelCollapsed ? 'Mostrar' : 'Ocultar'} Ferramentas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          >
            {rightPanelCollapsed ? 'Mostrar' : 'Ocultar'} Estrutura
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Toolbar */}
        {!leftPanelCollapsed && (
          <>
            <ResizablePanel defaultSize={10} minSize={8} maxSize={20}>
              <BookEditorToolbar
                fontFamily={fontFamily}
                fontSize={fontSize}
                lineHeight={lineHeight}
                useABNT={useABNT}
                onFontFamilyChange={setFontFamily}
                onFontSizeChange={setFontSize}
                onLineHeightChange={setLineHeight}
                onUseABNTChange={setUseABNT}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {/* Center Panel - Book */}
        <ResizablePanel defaultSize={leftPanelCollapsed && rightPanelCollapsed ? 100 : 80}>
          <div className="h-full flex flex-col bg-gradient-to-br from-muted/20 via-muted/10 to-background">
            {/* Book Content with Page Effect */}
            <div className="flex-1 overflow-auto p-8">
              <BookPageEffect className="h-full">
                <div className="p-12">
                  <BookPageRenderer
                    item={currentItem}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    lineHeight={lineHeight}
                    useABNT={useABNT}
                    onContentChange={handleUpdateContent}
                    onTitleChange={handleUpdateTitle}
                  />
                </div>
              </BookPageEffect>
            </div>

            {/* Navigation Footer */}
            <div className="h-16 border-t bg-background flex items-center justify-between px-8 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate(currentItemIndex - 1)}
                disabled={currentItemIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <div className="text-sm text-muted-foreground">
                {currentItemIndex + 1} / {items.length}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate(currentItemIndex + 1)}
                disabled={currentItemIndex === items.length - 1}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </ResizablePanel>

        {/* Right Panel - Structure */}
        {!rightPanelCollapsed && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={10} minSize={8} maxSize={20}>
              <BookEditorStructure
                items={items}
                currentIndex={currentItemIndex}
                onNavigate={handleNavigate}
                onAddChapter={handleAddChapter}
                onRefresh={loadBookData}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}

export default BookEditor
