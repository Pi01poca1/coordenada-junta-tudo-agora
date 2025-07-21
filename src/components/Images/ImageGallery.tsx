import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteImage } from '@/lib/supabaseStorage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Eye } from 'lucide-react';

interface Image {
  id: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  created_at: string;
}

interface ImageGalleryProps {
  chapterId: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ chapterId }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, [chapterId]);

  const fetchImages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (image: Image) => {
    if (!user) return;

    setDeleting(image.id);
    try {
      // Extract path from storage_path URL
      const urlParts = image.storage_path.split('/');
      const pathIndex = urlParts.findIndex(part => part === 'chapter-images');
      const storagePath = urlParts.slice(pathIndex + 1).join('/');

      // Delete from storage
      await deleteImage(storagePath);

      // Delete from database
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', image.id);

      if (dbError) {
        if (dbError.message.includes('row-level security') || dbError.message.includes('policy')) {
          toast({
            title: "Not allowed",
            description: "You don't have permission to delete this image",
            variant: "destructive",
          });
        } else {
          throw dbError;
        }
        return;
      }

      setImages(images.filter(img => img.id !== image.id));
      setSelectedImage(null);
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <div className="text-muted-foreground">Loading images...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">No images uploaded yet</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square">
            <img
              src={image.storage_path}
              alt={image.alt_text || 'Chapter image'}
              className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedImage(image)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedImage(image)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(image)}
                  disabled={deleting === image.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedImage?.alt_text || 'Chapter Image'}
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.storage_path}
                alt={selectedImage.alt_text || 'Chapter image'}
                className="w-full max-h-96 object-contain rounded-lg"
              />
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedImage.width && selectedImage.height && (
                    <span>{selectedImage.width} × {selectedImage.height}px</span>
                  )}
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedImage)}
                  disabled={deleting === selectedImage.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};