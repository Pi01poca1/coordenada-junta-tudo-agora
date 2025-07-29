import { useState, useEffect, useCallback } from 'react';
import { imageService, ImageData } from '@/services/images';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useImages = (bookId?: string, chapterId?: string) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchImages = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await imageService.getImages(user.id, bookId, chapterId);
      setImages(data);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar imagens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, bookId, chapterId, toast]);

  const updateImage = useCallback(async (imageId: string, updates: Partial<ImageData>) => {
    try {
      const updatedImage = await imageService.updateImage(imageId, updates);
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, ...updatedImage } : img
      ));
      return updatedImage;
    } catch (error) {
      console.error('Erro ao atualizar imagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar imagem",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const deleteImage = useCallback(async (imageId: string) => {
    try {
      await imageService.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast({
        title: "Sucesso",
        description: "Imagem removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover imagem",
        variant: "destructive"
      });
    }
  }, [toast]);

  const resetImageProperties = useCallback(async (imageId: string) => {
    try {
      const resetImage = await imageService.resetImageProperties(imageId);
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, ...resetImage } : img
      ));
      toast({
        title: "Sucesso",
        description: "Propriedades da imagem resetadas"
      });
    } catch (error) {
      console.error('Erro ao resetar imagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao resetar propriedades",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    loading,
    updateImage,
    deleteImage,
    resetImageProperties,
    refetch: fetchImages
  };
};