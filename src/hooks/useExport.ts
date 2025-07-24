import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ExportFormat = 'pdf' | 'epub' | 'docx' | 'html' | 'json';

interface ExportOptions {
  template?: string;
  includeImages?: boolean;
  chapterRange?: { start: number; end: number };
}

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportBook = async (
    bookId: string,
    format: ExportFormat,
    options: ExportOptions = {}
  ): Promise<string | null> => {
    setIsExporting(true);
    
    try {
      console.log('🔍 DEBUG: Starting export for book:', bookId, 'format:', format);
      
      const { data, error } = await supabase.functions.invoke('export-book', {
        body: {
          bookId,
          format,
          options
        }
      });

      console.log('🔍 DEBUG: Export function response:', { data, error });

      if (error) {
        console.error('Export function error:', error);
        throw new Error(error.message || 'Erro na função de exportação');
      }

      // The function now returns the file content directly
      if (typeof data === 'string' || data instanceof Uint8Array) {
        // Determine proper MIME type and create blob
        let mimeType: string;
        switch (format) {
          case 'pdf':
            mimeType = 'application/pdf';
            break;
          case 'docx':
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          case 'epub':
            mimeType = 'application/epub+zip';
            break;
          case 'html':
            mimeType = 'text/html';
            break;
          case 'json':
            mimeType = 'application/json';
            break;
          default:
            mimeType = 'application/octet-stream';
        }
        
        // Create blob from response with proper MIME type
        const blob = new Blob([data], { type: mimeType });
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `book_export_${timestamp}.${format}`;
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => window.URL.revokeObjectURL(url), 100);

        toast({
          title: "Exportação concluída!",
          description: `Livro exportado em ${format.toUpperCase()} com sucesso`,
        });

        return url;
      } else {
        throw new Error('Formato de resposta inválido da função de exportação');
      }
      
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Erro na exportação",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const getExportHistory = async (bookId?: string) => {
    try {
      let query = supabase
        .from('export_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (bookId) {
        query = query.eq('book_id', bookId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching export history:', error);
      return [];
    }
  };

  return {
    exportBook,
    getExportHistory,
    isExporting
  };
};