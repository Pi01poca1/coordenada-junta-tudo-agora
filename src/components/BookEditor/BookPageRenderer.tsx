import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { BookItem } from '@/pages/BookEditor'

interface BookPageRendererProps {
  item: BookItem | undefined
  fontFamily: string
  fontSize: number
  lineHeight: number
  useABNT: boolean
  onContentChange: (content: string) => void
  onTitleChange: (title: string) => void
}

export const BookPageRenderer = ({
  item,
  fontFamily,
  fontSize,
  lineHeight,
  useABNT,
  onContentChange,
  onTitleChange,
}: BookPageRendererProps) => {
  const [localTitle, setLocalTitle] = useState('')
  const [localContent, setLocalContent] = useState('')

  useEffect(() => {
    if (item) {
      setLocalTitle(item.data.title)
      setLocalContent(item.data.content || '')
    }
  }, [item])

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">📖</p>
          <p>Selecione um elemento para começar a escrever</p>
        </div>
      </div>
    )
  }

  // ABNT styles
  const abntStyles = useABNT ? {
    fontFamily: "'Times New Roman', serif",
    fontSize: '12pt',
    lineHeight: 1.5,
    padding: '3cm 2cm 2cm 3cm', // top right bottom left
  } : {}

  // Custom styles
  const customStyles = !useABNT ? {
    fontFamily,
    fontSize: `${fontSize}pt`,
    lineHeight,
  } : {}

  const pageStyles = {
    ...abntStyles,
    ...customStyles,
  }

  const handleTitleBlur = () => {
    if (localTitle !== item.data.title) {
      onTitleChange(localTitle)
    }
  }

  const handleContentBlur = () => {
    if (localContent !== item.data.content) {
      onContentChange(localContent)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Book Page - Paper appearance */}
      <div
        className={cn(
          'bg-white shadow-2xl rounded-sm min-h-[800px]',
          'border border-border/50'
        )}
        style={{
          padding: useABNT ? '3cm 2cm 2cm 3cm' : '3rem',
        }}
      >
        {/* Title */}
        <div className="mb-8">
          <Input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className={cn(
              'text-3xl font-bold border-none bg-transparent px-0',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'placeholder:text-muted-foreground/50'
            )}
            style={{
              fontFamily: pageStyles.fontFamily,
            }}
            placeholder="Título do elemento"
          />
          <div className="h-0.5 bg-gradient-to-r from-primary/50 to-transparent mt-2" />
        </div>

        {/* Content */}
        <Textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          onBlur={handleContentBlur}
          placeholder="Comece a escrever aqui... Esta é a sua página em branco, pronta para suas palavras."
          className={cn(
            'min-h-[600px] border-none bg-transparent resize-none',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            'placeholder:text-muted-foreground/30',
            'text-foreground'
          )}
          style={pageStyles}
        />

        {/* Page decoration - subtle corner fold effect */}
        <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-muted/20 to-transparent rounded-bl-lg" />
      </div>

      {/* Page info */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        {item.type === 'chapter' ? '📄 Capítulo' : '📋 Elemento'} • {localContent.length} caracteres
      </div>
    </div>
  )
}
