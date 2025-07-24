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
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Use Supabase functions invoke method for better reliability
      const { data, error } = await supabase.functions.invoke('export-book', {
        body: { bookId, format, options },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      console.log('🔍 DEBUG: Export response:', { data, error });

      if (error) {
        console.error('Export failed:', error);
        throw new Error(`Export failed: ${error.message}`);
      }

      // Create filename with timestamp and book info
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `livro_${timestamp}.${format}`;
      
      // Handle different response types
      let blob: Blob;
      
      if (format === 'json') {
        // For JSON, create blob from string data
        blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], {
          type: 'application/json'
        });
      } else if (format === 'html') {
        // For HTML, create blob from string data
        blob = new Blob([data], {
          type: 'text/html'
        });
      } else {
        // For PDF, DOCX, EPUB - handle as binary data
        if (data instanceof Blob) {
          blob = data;
        } else if (typeof data === 'string') {
          blob = new Blob([data], {
            type: format === 'pdf' ? 'application/pdf' : 
                  format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                  format === 'epub' ? 'application/epub+zip' : 'text/plain'
          });
        } else {
          blob = new Blob([JSON.stringify(data)], { type: 'application/octet-stream' });
        }
      }
      
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