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
      const { data, error } = await supabase.functions.invoke('export-book', {
        body: {
          bookId,
          format,
          options
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro na exportação');
      }

      // Download the file
      const { downloadUrl, filename } = data.data;
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída!",
        description: `Livro exportado em ${format.toUpperCase()} com sucesso`,
      });

      return downloadUrl;
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