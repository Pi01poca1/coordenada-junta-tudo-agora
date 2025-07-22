import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AIGoal = 'improve' | 'ideas' | 'expand' | 'grammar' | 'style';

interface EnrichResult {
  originalText: string;
  enrichedText: string;
  goal: AIGoal;
  confidence: number;
  provider: string;
  wordCountBefore: number;
  wordCountAfter: number;
}

interface PromptResult {
  prompt: string;
  suggestions: string[];
  confidence: number;
  provider: string;
  context: any;
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const enrichText = async (
    chapterId: string,
    text: string,
    goal: AIGoal
  ): Promise<EnrichResult | null> => {
    if (!text.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um texto para enriquecer",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-enrich', {
        body: {
          chapterId,
          text,
          goal
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      toast({
        title: "Texto enriquecido!",
        description: `${data.data.wordCountAfter - data.data.wordCountBefore} palavras adicionadas`,
      });

      return data.data;
    } catch (error: any) {
      console.error('Error enriching text:', error);
      toast({
        title: "Erro ao enriquecer texto",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generatePrompt = async (
    chapterId: string,
    text: string,
    context?: {
      genre?: string;
      mood?: string;
      style?: string;
    }
  ): Promise<PromptResult | null> => {
    if (!text.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um texto para gerar prompt",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-prompt', {
        body: {
          chapterId,
          text,
          context
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      toast({
        title: "Prompt gerado!",
        description: "Prompt de imagem criado com sucesso",
      });

      return data.data;
    } catch (error: any) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Erro ao gerar prompt",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAIHistory = async (chapterId?: string) => {
    try {
      let query = supabase
        .from('ai_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (chapterId) {
        query = query.eq('chapter_id', chapterId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching AI history:', error);
      return [];
    }
  };

  return {
    enrichText,
    generatePrompt,
    getAIHistory,
    isLoading
  };
};