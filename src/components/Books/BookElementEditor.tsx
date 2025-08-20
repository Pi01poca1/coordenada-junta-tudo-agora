import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Save, X, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface BookElement {
  id: string
  type: string
  title: string
  content: string | null
  enabled: boolean
}

interface BookElementEditorProps {
  element: BookElement
  onClose: () => void
  onUpdate: (element: BookElement) => void
}

export const BookElementEditor = ({ element, onClose, onUpdate }: BookElementEditorProps) => {
  const [title, setTitle] = useState(element.title)
  const [content, setContent] = useState(element.content || '')
  const [isPreview, setIsPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('book_elements')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', element.id)
        .select()
        .single()

      if (error) throw error

      onUpdate(data)
      toast({
        title: 'Sucesso',
        description: 'Elemento atualizado com sucesso',
      })
    } catch (error) {
      console.error('Error updating element:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar elemento',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const getElementDescription = (type: string) => {
    const descriptions = {
      cover: 'Capa do livro - primeira impressão visual',
      dedication: 'Dedicatória - homenagem pessoal do autor',
      acknowledgments: 'Agradecimentos - reconhecimento a pessoas importantes',
      preface: 'Prefácio - introdução escrita pelo autor ou terceiros',
      summary: 'Resumo - síntese do conteúdo do livro',
      introduction: 'Introdução - apresentação inicial do tema',
      epilogue: 'Epílogo - conclusão final da obra',
      about_author: 'Sobre o Autor - biografia e informações pessoais',
      bibliography: 'Bibliografia - referências e fontes utilizadas',
    }
    return descriptions[type as keyof typeof descriptions] || 'Elemento profissional'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{element.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {getElementDescription(element.type)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isPreview ? 'Editar' : 'Visualizar'}
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isPreview ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do elemento"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo do elemento..."
                className="min-h-[400px] resize-vertical"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <h2 className="text-2xl font-bold mb-4">{title}</h2>
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {content || 'Nenhum conteúdo adicionado ainda...'}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsPreview(false)}>
                Editar Conteúdo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}