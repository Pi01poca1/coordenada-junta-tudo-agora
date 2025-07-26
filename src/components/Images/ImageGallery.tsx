import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Copy, Download, Trash2, Image as ImageIcon, Settings, Move } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ImageEditor } from './ImageEditor';
import { ImagePositioner } from './ImagePositioner';

interface Image {
  id: string;
  filename: string;
  url: string;
  alt_text: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  book_id: string | null;
  chapter_id: string | null;
  position_x: number | null;
  position_y: number | null;
  scale: number | null;
  text_wrap: string | null;
  layout: string | null;
  z_index: number | null;
  width: number | null;
  height: number | null;
}

interface ImageGalleryProps {
  bookId?: string;
  chapterId?: string;
  onSelectImage?: (imageUrl: string, imageId: string) => void;
  selectable?: boolean;
}

export const ImageGallery = ({ bookId, chapterId, onSelectImage, selectable = false }: ImageGalleryProps) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [positioningImage, setPositioningImage] = useState<Image | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchImages();
    }
  }, [user, bookId, chapterId]);

  const fetchImages = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Filtrar por contexto se especificado
      if (chapterId) {
        console.log('🔍 ImageGallery: Filtering by chapterId:', chapterId);
        query = query.eq('chapter_id', chapterId);
      } else if (bookId) {
        console.log('🔍 ImageGallery: Filtering by bookId:', bookId, 'and chapter_id is null');
        query = query.eq('book_id', bookId).is('chapter_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log('🔍 ImageGallery: Query completed. Data:', data?.length || 0, 'images, Error:', error);
      setImages(data || []);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar galeria de imagens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(image =>
    image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.alt_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada!",
      description: "URL da imagem copiada para a área de transferência"
    });
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.click();
      
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro",
        description: "Falha ao baixar imagem",
        variant: "destructive"
      });
    }
  };

  const deleteImage = async (imageId: string, storagePath: string) => {
    try {
      // Determinar bucket baseado na presença de chapterId
      const bucketName = chapterId ? 'chapter-images' : 'book-images';
      
      // Remover do storage
      const pathParts = storagePath.split('/');
      const actualPath = pathParts.slice(1).join('/'); // Remove user_id prefix
      await supabase.storage.from(bucketName).remove([actualPath]);
      
      // Remover do banco
      await supabase.from('images').delete().eq('id', imageId);

      // Atualizar lista local
      setImages(prev => prev.filter(img => img.id !== imageId));

      toast({
        title: "Imagem removida",
        description: "Imagem deletada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover imagem",
        variant: "destructive"
      });
    }
  };

  const handleSelectImage = (image: Image) => {
    if (selectable && onSelectImage) {
      setSelectedImageId(image.id);
      onSelectImage(image.url, image.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Carregando galeria de imagens...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Galeria de Imagens</span>
            <Badge variant="secondary">{filteredImages.length}</Badge>
          </div>
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar imagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredImages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'Nenhuma imagem encontrada para a busca' : 'Nenhuma imagem na galeria'}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div 
                key={image.id} 
                className={`group relative border rounded-lg overflow-hidden ${
                  selectable && selectedImageId === image.id 
                    ? 'ring-2 ring-primary' 
                    : ''
                } ${selectable ? 'cursor-pointer hover:ring-1 hover:ring-primary' : ''}`}
                onClick={() => handleSelectImage(image)}
              >
                <div className="aspect-square">
                  <img
                    src={image.url}
                    alt={image.alt_text}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200">
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="space-y-1">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingImage(image);
                          }}
                          className="flex-1"
                          title="Editar propriedades"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPositioningImage(image);
                          }}
                          className="flex-1"
                          title="Posicionar imagem"
                        >
                          <Move className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyImageUrl(image.url);
                          }}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(image.url, image.filename);
                          }}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(image.id, image.url);
                          }}
                          className="flex-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações da imagem */}
                <div className="p-2 bg-background">
                  <p className="text-xs font-medium truncate" title={image.filename}>
                    {image.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(image.file_size)}
                  </p>
                  {image.alt_text && (
                    <p className="text-xs text-muted-foreground truncate" title={image.alt_text}>
                      {image.alt_text}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Edição */}
        {editingImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <ImageEditor
              image={editingImage}
              onClose={() => setEditingImage(null)}
              onUpdate={() => {
                fetchImages();
                setEditingImage(null);
              }}
            />
          </div>
        )}

        {/* Modal de Posicionamento */}
        {positioningImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <ImagePositioner
              image={positioningImage}
              onClose={() => setPositioningImage(null)}
              onUpdate={() => {
                fetchImages();
                setPositioningImage(null);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};