import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, X, ExternalLink, Trash2 } from 'lucide-react';

interface CoverData {
  id: string;
  image_id: string;
  image: {
    id: string;
    filename: string;
    url: string;
    alt_text: string | null;
    file_size: number | null;
  };
}

interface CoverPreviewProps {
  bookId: string;
  onCoverRemoved?: () => void;
}

export const CoverPreview = ({ bookId, onCoverRemoved }: CoverPreviewProps) => {
  const [cover, setCover] = useState<CoverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔍 CoverPreview: useEffect triggered', { bookId, user: !!user });
    fetchCover();
  }, [bookId, user]);

  const fetchCover = async () => {
    if (!user) {
      console.log('🔍 CoverPreview: No user, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 CoverPreview: Fetching cover for book', bookId);
      
      const { data, error } = await supabase
        .from('book_covers')
        .select(`
          id,
          image_id,
          image:images!inner(
            id,
            filename,
            url,
            alt_text,
            file_size
          )
        `)
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('🔍 CoverPreview: Query result', { data, error });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        console.log('🔍 CoverPreview: Cover found', data[0]);
        setCover(data[0] as any);
      } else {
        console.log('🔍 CoverPreview: No cover found');
        setCover(null);
      }
    } catch (error) {
      console.error('🔍 CoverPreview: Erro ao buscar capa:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeCover = async () => {
    if (!cover || !user) return;

    setRemoving(true);
    try {
      const { error } = await supabase
        .from('book_covers')
        .delete()
        .eq('book_id', bookId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCover(null);
      toast({
        title: "Capa removida",
        description: "A capa foi removida com sucesso"
      });

      if (onCoverRemoved) {
        onCoverRemoved();
      }
    } catch (error) {
      console.error('Erro ao remover capa:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover capa",
        variant: "destructive"
      });
    } finally {
      setRemoving(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Capa Atual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-pulse">Carregando capa...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cover) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Capa Atual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhuma capa definida</p>
            <p className="text-xs text-muted-foreground mt-1">
              Use as opções acima para definir uma capa
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Capa Atual</span>
          </CardTitle>
          <Badge variant="secondary">Ativa</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview da capa */}
        <div className="relative group">
          <div className="aspect-[2/3] w-full max-w-[200px] mx-auto">
            <img
              src={cover.image.url}
              alt={cover.image.alt_text || cover.image.filename}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
          
          {/* Overlay com botões */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(cover.image.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={removeCover}
              disabled={removing}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Informações da capa */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Arquivo:</span>
            <span className="ml-2 text-muted-foreground">{cover.image.filename}</span>
          </div>
          <div>
            <span className="font-medium">Tamanho:</span>
            <span className="ml-2 text-muted-foreground">{formatFileSize(cover.image.file_size)}</span>
          </div>
        </div>

        {/* Botão de remoção */}
        <Button
          variant="outline"
          size="sm"
          onClick={removeCover}
          disabled={removing}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          {removing ? 'Removendo...' : 'Remover Capa'}
        </Button>
      </CardContent>
    </Card>
  );
};