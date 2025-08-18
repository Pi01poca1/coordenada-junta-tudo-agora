import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export type ExportFormat = 'pdf' | 'epub' | 'docx' | 'html' | 'json'

interface ExportOptions {
  template?: string
  includeImages?: boolean
  chapterRange?: { start: number; end: number }
}

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportBook = async (
    bookId: string,
    format: ExportFormat,
    options: ExportOptions = {}
  ): Promise<string | null> => {
    setIsExporting(true)

    try {
      console.log('🚀 Iniciando exportação:', { bookId, format, options })

      // Get session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Não autenticado')

      console.log('🔐 Sessão obtida, fazendo chamada para edge function...')

      // Call the new base64-enabled edge function
      const { data, error } = await supabase.functions.invoke('export-book', {
        body: { bookId, format, options },
      })

      console.log('📥 Resposta da função - Raw response:', { data, error })

      if (error) {
        console.error('❌ Export failed:', error)
        throw new Error(`Erro na função: ${error.message}`)
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Erro desconhecido na geração')
      }

      // Extract base64 data and metadata
      const { data: base64Data, mimeType, filename } = data

      console.log('📄 Processando arquivo:', {
        format,
        filename,
        mimeType,
        base64Length: base64Data?.length,
      })

      // Convert base64 to binary
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Create blob with correct MIME type
      const blob = new Blob([bytes], { type: mimeType })

      console.log('📄 Arquivo criado:', {
        size: blob.size,
        type: blob.type,
        filename,
      })

      // Create download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(url), 100)

      toast({
        title: 'Exportação concluída!',
        description: `${filename} baixado com sucesso`,
      })

      return url
    } catch (error: any) {
      console.error('❌ Erro na exportação:', error)
      toast({
        title: 'Erro na exportação',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsExporting(false)
    }
  }

  const getExportHistory = async (bookId?: string) => {
    try {
      let query = supabase
        .from('export_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (bookId) {
        query = query.eq('book_id', bookId)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching export history:', error)
      return []
    }
  }

  return {
    exportBook,
    getExportHistory,
    isExporting,
  }
}
