import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { 
  BookOpen, 
  FileText, 
  Plus, 
  List,
  BookCopy,
  Heart,
  Users,
  Quote,
  FileSignature,
  RefreshCw
} from 'lucide-react'
import type { BookItem } from '@/pages/BookEditor'

interface BookEditorStructureProps {
  items: BookItem[]
  currentIndex: number
  onNavigate: (index: number) => void
  onAddChapter: () => void
  onRefresh: () => void
}

const elementIcons: Record<string, any> = {
  cover: BookCopy,
  dedication: Heart,
  acknowledgments: Users,
  epigraph: Quote,
  preface: FileSignature,
  introduction: FileText,
  conclusion: FileText,
  bibliography: List,
  glossary: List,
}

export const BookEditorStructure = ({
  items,
  currentIndex,
  onNavigate,
  onAddChapter,
  onRefresh,
}: BookEditorStructureProps) => {
  return (
    <div className="h-full bg-background border-l flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Estrutura
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={onAddChapter}
          size="sm"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Capítulo
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {items.map((item, index) => {
            const isActive = index === currentIndex
            const Icon = item.type === 'chapter' 
              ? FileText 
              : elementIcons[item.data.type] || FileText

            return (
              <button
                key={item.data.id}
                onClick={() => onNavigate(index)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'flex items-start gap-2',
                  isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {item.data.title}
                  </div>
                  <div className={cn(
                    'text-xs truncate',
                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}>
                    {item.type === 'chapter' ? 'Capítulo' : 'Elemento'}
                  </div>
                </div>
                <div className={cn(
                  'text-xs font-mono flex-shrink-0',
                  isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}>
                  {index + 1}
                </div>
              </button>
            )
          })}

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum elemento ainda</p>
              <p className="text-xs mt-1">Adicione um capítulo para começar</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between mb-1">
          <span>Total de itens:</span>
          <span className="font-semibold">{items.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Capítulos:</span>
          <span className="font-semibold">
            {items.filter(i => i.type === 'chapter').length}
          </span>
        </div>
      </div>
    </div>
  )
}
