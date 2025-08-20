import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Navigation } from '@/components/Layout/Navigation'
import { DraggableChapterList } from '@/components/Chapters/DraggableChapterList'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Edit, Calendar, Clock, ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ExportPanel } from '@/components/Export/ExportPanel'
import { BookElementsManager } from '@/components/Books/BookElementsManager'
import { TableOfContents } from '@/components/Books/TableOfContents'
import { AlignmentControls, TextAlignment, getAlignmentClass } from '@/components/ui/alignment-controls'

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
  const [tocOpen, setTocOpen] = useState(true)
  const [elementsOpen, setElementsOpen] = useState(false)
  const [chaptersOpen, setChaptersOpen] = useState(true)
  const [showAlignmentControls, setShowAlignmentControls] = useState(false)
  const [titleAlignment, setTitleAlignment] = useState<TextAlignment>('left')
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const tocRef = useRef<{ refreshTOC: () => Promise<void> }>(null)

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

  const handleElementUpdate = async () => {
    if (tocRef.current) {
      await tocRef.current.refreshTOC()
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
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAlignmentControls(!showAlignmentControls)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Alinhamento de Títulos
            </Button>
            {showAlignmentControls && (
              <AlignmentControls
                alignment={titleAlignment}
                onAlignmentChange={setTitleAlignment}
              />
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar with Book Info and Export */}
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
            <ExportPanel bookId={book.id} bookTitle={book.title} totalChapters={chapterCount} />
          </div>

          {/* Main Content Area */}
          <div className="space-y-6 lg:col-span-3">
            {/* Table of Contents - Top Priority */}
            <Collapsible open={tocOpen} onOpenChange={setTocOpen}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={`text-lg ${getAlignmentClass(titleAlignment)}`}>Sumário</CardTitle>
                      <CardDescription className={getAlignmentClass(titleAlignment)}>Visualização profissional do índice do livro</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {tocOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="max-h-80 overflow-y-auto rounded-md border bg-muted/20 p-4">
                      <TableOfContents ref={tocRef} bookId={book.id} titleAlignment={titleAlignment} />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Professional Elements */}
            <Collapsible open={elementsOpen} onOpenChange={setElementsOpen}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={`text-lg ${getAlignmentClass(titleAlignment)}`}>Elementos Profissionais</CardTitle>
                      <CardDescription className={getAlignmentClass(titleAlignment)}>Capa, dedicatória, prefácio e outros elementos do livro</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {elementsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto rounded-md border bg-muted/20 p-4">
                      <BookElementsManager bookId={book.id} onElementUpdate={handleElementUpdate} titleAlignment={titleAlignment} />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Chapters - Scrollable with 2 visible */}
            <Collapsible open={chaptersOpen} onOpenChange={setChaptersOpen}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={`text-lg ${getAlignmentClass(titleAlignment)}`}>Capítulos</CardTitle>
                      <CardDescription className={getAlignmentClass(titleAlignment)}>Gerenciar e organizar os capítulos do livro</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {chaptersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="max-h-[600px] overflow-y-auto rounded-md border bg-muted/20 p-4">
                      <DraggableChapterList bookId={book.id} titleAlignment={titleAlignment} />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BookDetails
