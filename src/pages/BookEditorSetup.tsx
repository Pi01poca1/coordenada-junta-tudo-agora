import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  BookCopy, 
  Heart, 
  Users, 
  Quote, 
  FileSignature, 
  FileText,
  List,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

interface ElementOption {
  type: string
  title: string
  description: string
  icon: any
  enabled: boolean
}

const BookEditorSetup = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [elements, setElements] = useState<ElementOption[]>([
    {
      type: 'cover',
      title: 'Capa',
      description: 'Capa e contracapa do livro',
      icon: BookCopy,
      enabled: true,
    },
    {
      type: 'dedication',
      title: 'Dedicatória',
      description: 'Dedicatória do autor',
      icon: Heart,
      enabled: false,
    },
    {
      type: 'acknowledgments',
      title: 'Agradecimentos',
      description: 'Agradecimentos do autor',
      icon: Users,
      enabled: false,
    },
    {
      type: 'epigraph',
      title: 'Epígrafe',
      description: 'Citação inicial',
      icon: Quote,
      enabled: false,
    },
    {
      type: 'preface',
      title: 'Prefácio',
      description: 'Introdução ao livro',
      icon: FileSignature,
      enabled: false,
    },
    {
      type: 'introduction',
      title: 'Introdução',
      description: 'Apresentação do conteúdo',
      icon: FileText,
      enabled: false,
    },
    {
      type: 'conclusion',
      title: 'Conclusão',
      description: 'Encerramento do livro',
      icon: FileText,
      enabled: false,
    },
    {
      type: 'bibliography',
      title: 'Bibliografia',
      description: 'Referências bibliográficas',
      icon: List,
      enabled: false,
    },
    {
      type: 'glossary',
      title: 'Glossário',
      description: 'Definições de termos',
      icon: List,
      enabled: false,
    },
  ])

  useEffect(() => {
    if (bookId && user) {
      loadBook()
    }
  }, [bookId, user])

  const loadBook = async () => {
    try {
      setLoading(true)
      
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      if (bookError) throw bookError
      setBook(bookData)

      // Load existing elements
      const { data: existingElements, error: elementsError } = await supabase
        .from('book_elements')
        .select('type, enabled')
        .eq('book_id', bookId)

      if (elementsError) throw elementsError

      // Update elements state with existing data
      if (existingElements && existingElements.length > 0) {
        setElements(prev => prev.map(el => {
          const existing = existingElements.find(e => e.type === el.type)
          return existing ? { ...el, enabled: existing.enabled } : el
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar livro:', error)
      toast.error('Erro ao carregar livro')
    } finally {
      setLoading(false)
    }
  }

  const toggleElement = (type: string) => {
    setElements(prev => prev.map(el => 
      el.type === type ? { ...el, enabled: !el.enabled } : el
    ))
  }

  const handleContinue = async () => {
    if (!bookId || !user) return

    try {
      setSaving(true)

      // Get existing elements
      const { data: existingElements } = await supabase
        .from('book_elements')
        .select('id, type')
        .eq('book_id', bookId)

      // Create or update elements
      for (const element of elements) {
        const existing = existingElements?.find(e => e.type === element.type)
        
        if (existing) {
          // Update existing
          await supabase
            .from('book_elements')
            .update({ enabled: element.enabled })
            .eq('id', existing.id)
        } else if (element.enabled) {
          // Create new only if enabled
          await supabase
            .from('book_elements')
            .insert({
              book_id: bookId,
              type: element.type,
              title: element.title,
              content: '',
              enabled: true,
              order_index: elements.indexOf(element),
            })
        }
      }

      toast.success('Configuração salva!')
      navigate(`/book-editor/${bookId}`)
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      toast.error('Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold mb-2">Configure seu livro</h1>
          <p className="text-muted-foreground">
            Escolha os elementos que deseja incluir na edição de <strong>{book?.title}</strong>
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Elementos do Livro</CardTitle>
            <CardDescription>
              Selecione os elementos que farão parte do seu livro. 
              Você poderá alterá-los depois no editor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {elements.map((element) => {
                const Icon = element.icon
                return (
                  <div
                    key={element.type}
                    className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => toggleElement(element.type)}
                  >
                    <Checkbox
                      checked={element.enabled}
                      onCheckedChange={() => toggleElement(element.type)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-primary" />
                        <Label className="font-semibold cursor-pointer">
                          {element.title}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {element.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {elements.filter(e => e.enabled).length} elemento(s) selecionado(s)
          </p>
          <Button
            onClick={handleContinue}
            disabled={saving}
            size="lg"
          >
            {saving ? 'Salvando...' : 'Continuar para o Editor'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BookEditorSetup
