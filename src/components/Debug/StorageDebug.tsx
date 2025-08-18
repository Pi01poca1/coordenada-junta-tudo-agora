import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface StorageDebugProps {
  bookId?: string
}

interface DebugResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export default function StorageDebug({ bookId }: StorageDebugProps) {
  const [results, setResults] = useState<DebugResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (
    test: string,
    status: 'success' | 'error' | 'warning',
    message: string,
    details?: any
  ) => {
    setResults((prev) => [...prev, { test, status, message, details }])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    try {
      // 1. Testar autenticação
      addResult('auth', 'warning', 'Verificando autenticação...')
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        addResult('auth', 'error', 'Usuário não autenticado', authError)
        return
      }

      addResult('auth', 'success', `Usuário autenticado: ${user.email}`, {
        user_id: user.id,
        email: user.email,
      })

      // 2. Verificar bucket
      addResult('bucket', 'warning', 'Verificando bucket book-images...')
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

      if (bucketError) {
        addResult('bucket', 'error', 'Erro ao listar buckets', bucketError)
      } else {
        const bookImagesBucket = buckets.find((b) => b.id === 'book-images')
        if (bookImagesBucket) {
          addResult('bucket', 'success', 'Bucket book-images encontrado', bookImagesBucket)
        } else {
          addResult('bucket', 'error', 'Bucket book-images não encontrado', {
            available_buckets: buckets.map((b) => b.id),
          })
        }
      }

      // 3. Testar listagem de arquivos do usuário
      addResult('storage_list', 'warning', 'Testando listagem de arquivos...')
      const userPath = `${user.id}/`
      const { data: files, error: listError } = await supabase.storage
        .from('book-images')
        .list(userPath)

      if (listError) {
        addResult('storage_list', 'error', 'Erro ao listar arquivos', listError)
      } else {
        addResult(
          'storage_list',
          'success',
          `Listagem funcionando. Arquivos encontrados: ${files?.length || 0}`,
          files
        )
      }

      // 4. Testar permissões da tabela images
      addResult('table_images', 'warning', 'Verificando tabela images...')
      const { data: imagesData, error: imagesError } = await supabase
        .from('images')
        .select('id, filename, created_at')
        .limit(5)

      if (imagesError) {
        addResult('table_images', 'error', 'Erro ao acessar tabela images', imagesError)
      } else {
        addResult(
          'table_images',
          'success',
          `Acesso à tabela images OK. Registros: ${imagesData?.length || 0}`,
          imagesData
        )
      }

      // 5. Teste de upload simulado
      addResult('upload_test', 'warning', 'Testando upload (arquivo de teste)...')
      const testBlob = new Blob(['test image content'], { type: 'text/plain' })
      const testPath = `${user.id}/test-${Date.now()}.txt`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('book-images')
        .upload(testPath, testBlob)

      if (uploadError) {
        addResult('upload_test', 'error', 'Erro no teste de upload', uploadError)
      } else {
        addResult('upload_test', 'success', 'Teste de upload bem-sucedido', uploadData)

        // Limpar arquivo de teste
        await supabase.storage.from('book-images').remove([testPath])
      }

      // 6. Verificar se bookId foi fornecido e existe
      if (bookId) {
        addResult('book_check', 'warning', 'Verificando livro...')
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('id, title, owner_id')
          .eq('id', bookId)
          .single()

        if (bookError) {
          addResult('book_check', 'error', 'Erro ao verificar livro', bookError)
        } else {
          addResult('book_check', 'success', `Livro encontrado: ${bookData.title}`, bookData)
        }
      }
    } catch (error) {
      addResult('general', 'error', 'Erro geral no diagnóstico', error)
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [bookId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return '🔍'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-lg border bg-background shadow-lg">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">🔍 Diagnóstico do Supabase Storage</h2>
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isRunning ? 'Executando...' : 'Executar Novamente'}
            </button>
          </div>
          {bookId && (
            <p className="mt-2 text-sm text-muted-foreground">Testando para o livro: {bookId}</p>
          )}
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className={`rounded-lg border p-4 ${getStatusColor(result.status)}`}>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">{getStatusIcon(result.status)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{result.test}</h3>
                      <span className="rounded bg-white bg-opacity-50 px-2 py-1 text-xs">
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm underline">Ver detalhes</summary>
                        <pre className="mt-2 max-h-40 overflow-auto rounded bg-white bg-opacity-50 p-2 text-xs">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isRunning && (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-muted-foreground">Executando diagnósticos...</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <h3 className="mb-2 font-medium">📋 Resumo dos Testes</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded bg-green-100 p-3">
            <div className="text-2xl font-bold text-green-600">
              {results.filter((r) => r.status === 'success').length}
            </div>
            <div className="text-sm text-green-600">Sucessos</div>
          </div>
          <div className="rounded bg-yellow-100 p-3">
            <div className="text-2xl font-bold text-yellow-600">
              {results.filter((r) => r.status === 'warning').length}
            </div>
            <div className="text-sm text-yellow-600">Avisos</div>
          </div>
          <div className="rounded bg-red-100 p-3">
            <div className="text-2xl font-bold text-red-600">
              {results.filter((r) => r.status === 'error').length}
            </div>
            <div className="text-sm text-red-600">Erros</div>
          </div>
        </div>
      </div>
    </div>
  )
}
