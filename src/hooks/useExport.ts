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
      // Call the export function and get the file directly
      const response = await fetch('/api/export-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          bookId,
          format,
          options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na exportação');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1] || 
                      `book_export_${new Date().toISOString().slice(0, 10)}.${format}`;

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída!",
        description: `Livro exportado em ${format.toUpperCase()} com sucesso`,
      });

      return url;
    } catch (error: any) {
      console.error('Export error:', error);
      
      // Fallback to the old Supabase function method
      try {
        const { data, error: supabaseError } = await supabase.functions.invoke('export-book', {
          body: {
            bookId,
            format,
            options
          }
        });

        if (supabaseError) throw supabaseError;

        if (!data.success) {
          throw new Error(data.error || 'Erro na exportação');
        }

        // Download the file using the old method
        const { downloadUrl, filename } = data.data;
        
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
      } catch (fallbackError: any) {
        console.error('Fallback export error:', fallbackError);
        toast({
          title: "Erro na exportação",
          description: fallbackError.message || "Tente novamente",
          variant: "destructive"
        });
        return null;
      }
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