import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

export const BookForm = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('draft')
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (id && id !== 'new') {
      setIsEdit(true)
      fetchBook(id)
    }
  }, [id])

  const fetchBook = async (bookId: string) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .eq('owner_id', user?.id)
        .single()

      if (error) throw error

      if (data) {
        setTitle(data.title)
        setDescription(data.description || '')
        setStatus(data.status)
      }
    } catch (error) {
      console.error('Error fetching book:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar livro',
        variant: 'destructive',
      })
      navigate('/dashboard')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      if (isEdit && id) {
        const { error } = await supabase
          .from('books')
          .update({
            title,
            description,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('owner_id', user.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('books').insert({
          title,
          description,
          status,
          owner_id: user.id,
        })

        if (error) throw error
      }

      toast({
        title: 'Sucesso',
        description: `Livro ${isEdit ? 'atualizado' : 'criado'} com sucesso`,
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving book:', error)
      toast({
        title: 'Erro',
        description: `Falha ao ${isEdit ? 'atualizar' : 'criar'} livro`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Painel
        </Button>
        <h1 className="text-3xl font-bold">{isEdit ? 'Editar Livro' : 'Criar Novo Livro'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar Detalhes do Livro' : 'Informações do Livro'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Atualize os detalhes do seu livro' : 'Digite os detalhes do seu novo livro'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Digite o título do livro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite a descrição do livro (opcional)"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : isEdit ? 'Atualizar Livro' : 'Criar Livro'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
