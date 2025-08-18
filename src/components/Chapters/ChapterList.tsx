import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Eye,
  TestTube,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Chapter {
  id: string
  title: string
  content: string | null
  order_index: number | null
  created_at: string
  updated_at: string
  book_id: string
}

interface ChapterListProps {
  bookId?: string
}

export const ChapterList = ({ bookId: propBookId }: ChapterListProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const { bookId: paramBookId } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  // Use prop bookId if provided, otherwise use param bookId
  const bookId = propBookId || paramBookId

  // Helper function to add debug logs
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log('🔍 DEBUG:', logMessage)
    setDebugLogs((prev) => [...prev.slice(-10), logMessage]) // Keep last 10 logs
  }

  useEffect(() => {
    addDebugLog('Componente ChapterList montado')
    addDebugLog(
      `propBookId: ${propBookId}, paramBookId: ${paramBookId}, bookId final: ${bookId}, usuário: ${user?.id}`
    )

    if (bookId && user) {
      fetchChapters()
    } else {
      addDebugLog('bookId ou usuário ausente, pulando busca')
      setLoading(false)
    }
  }, [bookId, user, propBookId, paramBookId])

  const fetchChapters = async () => {
    addDebugLog('Iniciando fetchChapters')

    if (!user || !bookId) {
      addDebugLog('fetchChapters abortado: usuário ou bookId ausente')
      setLoading(false)
      return
    }

    try {
      setError(null)
      addDebugLog('Executando consulta Supabase...')

      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true })

      addDebugLog(
        `Consulta concluída. Dados: ${data?.length || 0} capítulos, Erro: ${error?.message || 'nenhum'}`
      )

      if (error) {
        addDebugLog(`Erro Supabase: ${error.message}`)
        throw new Error(`Erro no banco de dados: ${error.message}`)
      }

      setChapters(data || [])
      addDebugLog(`Capítulos definidos no estado: ${data?.length || 0}`)
    } catch (error: any) {
      addDebugLog(`Erro fetchChapters: ${error.message}`)
      setError(error.message)

      toast({
        title: '❌ Erro ao Carregar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      addDebugLog('fetchChapters concluído, loading definido como false')
    }
  }

  const createTestChapter = async () => {
    addDebugLog('🧪 função createTestChapter chamada!')

    if (!user || !bookId) {
      addDebugLog('❌ Não é possível criar: usuário ou bookId ausente')
      toast({
        title: '❌ Erro',
        description: 'ID do usuário ou livro ausente',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsCreating(true)
      addDebugLog('Iniciando criação do capítulo...')

      const testChapter = {
        book_id: bookId,
        title: `Capítulo Teste ${Date.now()}`,
        content: 'Este é um capítulo de teste criado para fins de depuração.',
        order_index: chapters.length + 1,
      }

      addDebugLog(`Dados do capítulo teste: ${JSON.stringify(testChapter)}`)

      const { data, error } = await supabase
        .from('chapters')
        .insert([testChapter])
        .select()
        .single()

      addDebugLog(`Resultado da inserção - Dados: ${!!data}, Erro: ${error?.message || 'nenhum'}`)

      if (error) {
        addDebugLog(`❌ Erro na inserção: ${JSON.stringify(error)}`)
        throw error
      }

      addDebugLog('✅ Capítulo criado com sucesso!')
      setChapters([...chapters, data])

      toast({
        title: '✅ Sucesso!',
        description: 'Capítulo de teste criado com sucesso!',
      })

      addDebugLog('Toast exibido, função concluída')
    } catch (error: any) {
      addDebugLog(`❌ erro createTestChapter: ${error.message}`)
      console.error('💥 Objeto de erro completo:', error)

      toast({
        title: '❌ Erro',
        description: `Falha ao criar capítulo: ${error.message}`,
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
      addDebugLog('bloco finally do createTestChapter executado')
    }
  }

  const testButtonClick = () => {
    addDebugLog('🔘 Botão de teste clicado!')
    alert('Clique no botão detectado! Verifique o console para logs detalhados.')
    createTestChapter()
  }

  const clearLogs = () => {
    setDebugLogs([])
    addDebugLog('Logs de depuração limpos')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex min-h-32 items-center justify-center">
          <div className="text-muted-foreground">🔄 Carregando capítulos...</div>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">🔄 Estado Carregando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              {debugLogs.map((log, index) => (
                <div key={index} className="font-mono">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Debug Logs Card */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-purple-800">🔍 Logs de Depuração</CardTitle>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Limpar Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-32 space-y-1 overflow-y-auto text-xs">
            {debugLogs.length === 0 ? (
              <div>Nenhum log ainda...</div>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index} className="font-mono text-purple-700">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm text-blue-800">📊 Status Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-xs text-blue-700">
            <div>
              <strong>ID do Livro:</strong> {bookId || 'AUSENTE'}
            </div>
            <div>
              <strong>ID do Usuário:</strong> {user?.id || 'AUSENTE'}
            </div>
            <div>
              <strong>Contagem de Capítulos:</strong> {chapters.length}
            </div>
            <div>
              <strong>Está Criando:</strong> {isCreating ? 'SIM' : 'NÃO'}
            </div>
            <div>
              <strong>Erro:</strong> {error || 'Nenhum'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">❌ Erro ao Carregar Capítulos</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={fetchChapters} variant="outline">
                🔄 Tentar Novamente
              </Button>
              <Button onClick={testButtonClick} variant="outline" disabled={isCreating}>
                🧪 Teste Criar {isCreating && '(Criando...)'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📚 Capítulos</h2>
          <p className="text-muted-foreground">Organize o conteúdo do seu livro</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/books/${bookId}/chapters/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Capítulo
            </Button>
          </Link>
          <Button
            onClick={testButtonClick}
            variant="outline"
            size="sm"
            disabled={isCreating}
            className="bg-yellow-100 hover:bg-yellow-200"
          >
            <TestTube className="mr-2 h-4 w-4" />
            {isCreating ? '⏳ Criando...' : 'Teste Criar'}
          </Button>
        </div>
      </div>

      {/* Chapters Content */}
      {!error && chapters.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="py-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">📝 Nenhum capítulo encontrado</h3>
              <p className="mb-4 text-muted-foreground">
                Nenhum capítulo encontrado para este livro. Tente criar um!
              </p>
              <div className="flex justify-center gap-2">
                <Link to={`/books/${bookId}/chapters/new`}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Capítulo
                  </Button>
                </Link>
                <Button
                  onClick={testButtonClick}
                  variant="outline"
                  disabled={isCreating}
                  className="bg-green-100 hover:bg-green-200"
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  {isCreating ? '⏳ Criando...' : 'Criar Capítulo Teste'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : !error && chapters.length > 0 ? (
        <div className="space-y-3">
          {chapters.map((chapter, index) => (
            <Card key={chapter.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Capítulo {chapter.order_index || index + 1}
                      </Badge>
                      <CardTitle className="text-lg">{chapter.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      Última atualização{' '}
                      {formatDistanceToNow(new Date(chapter.updated_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                      {chapter.content && (
                        <span className="ml-2">
                          • {Math.ceil(chapter.content.length / 250)} min de leitura
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/books/${bookId}/chapters/${chapter.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </Link>
                    <Link to={`/books/${bookId}/chapters/${chapter.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              {chapter.content && (
                <CardContent className="pt-0">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {chapter.content.substring(0, 150)}...
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}
