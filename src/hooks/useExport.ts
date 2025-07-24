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

      // Make direct fetch request to edge function
      const baseUrl = 'https://rfxrguxoqnspsrqzzwlc.supabase.co/functions/v1/export-book';
      
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmeHJndXhvcW5zcHNycXp6d2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjUwNTIsImV4cCI6MjA2ODU0MTA1Mn0.PJ5jrYu6eXVuaVVel8fJTqRsn9FFWYMTJw2q1u1y8fc'
        },
        body: JSON.stringify({ bookId, format, options })
      });

      console.log('🔍 DEBUG: Export response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Export failed:', errorText);
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }

      // Get the response content directly as blob for binary formats
      const blob = await response.blob();
      
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