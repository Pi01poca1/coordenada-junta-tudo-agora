import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BookOpen, ChevronRight, RefreshCw, FileText, Heart, Users, Quote, Award } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

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

interface TableOfContentsProps {
  bookId: string
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

export const TableOfContents = ({ bookId }: TableOfContentsProps) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

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
          <div className="space-y-2">
            {tocItems.map((item, index) => {
              const Icon = item.type === 'chapter' 
                ? FileText 
                : elementIcons[item.type as keyof typeof elementIcons] || FileText

              return (
                <div key={`${item.type}-${item.id}`}>
                  {index > 0 && tocItems[index - 1].type !== item.type && (
                    <Separator className="my-3" />
                  )}
                  <div 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      item.enabled === false 
                        ? 'opacity-50 bg-muted/30' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={item.type === 'chapter' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.type === 'chapter' ? 'Capítulo' : 'Elemento'}
                          </Badge>
                          {item.enabled === false && (
                            <Badge variant="outline" className="text-xs">
                              Desabilitado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Página {item.pageNumber}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
}