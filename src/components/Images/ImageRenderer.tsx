import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Image {
  id: string;
  url: string;
  alt_text: string;
  filename: string;
  position_x: number | null;
  position_y: number | null;
  scale: number | null;
  text_wrap: string | null;
  layout: string | null;
  z_index: number | null;
  width: number | null;
  height: number | null;
}

interface ImageRendererProps {
  chapterId?: string;
  bookId?: string;
}

export const ImageRenderer = ({ chapterId, bookId }: ImageRendererProps) => {
  const [images, setImages] = useState<Image[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && (chapterId || bookId)) {
      fetchImages();
    }
  }, [user, chapterId, bookId]);

  const fetchImages = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (chapterId) {
        query = query.eq('chapter_id', chapterId);
      } else if (bookId) {
        query = query.eq('book_id', bookId).is('chapter_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    }
  };

  const getImageStyle = (image: Image) => {
    const baseStyle: React.CSSProperties = {
      maxWidth: '100%',
      height: 'auto',
      transform: `scale(${image.scale || 1})`,
      zIndex: image.z_index || 0,
    };

    // Aplicar posicionamento se especificado
    if (image.position_x !== null || image.position_y !== null) {
      baseStyle.position = 'relative';
      if (image.position_x !== null) baseStyle.left = `${image.position_x}px`;
      if (image.position_y !== null) baseStyle.top = `${image.position_y}px`;
    }

    return baseStyle;
  };

  const getContainerClasses = (image: Image) => {
    const baseClasses = ['my-4'];

    switch (image.layout) {
      case 'center':
        baseClasses.push('text-center');
        break;
      case 'float-left':
        baseClasses.push('float-left', 'mr-4', 'mb-2');
        break;
      case 'float-right':
        baseClasses.push('float-right', 'ml-4', 'mb-2');
        break;
      case 'full-width':
        baseClasses.push('w-full');
        break;
      case 'block':
        baseClasses.push('block', 'my-6');
        break;
      case 'inline':
      default:
        baseClasses.push('inline-block');
        break;
    }

    // Aplicar text wrap
    switch (image.text_wrap) {
      case 'wrap':
        baseClasses.push('clear-none');
        break;
      case 'break':
        baseClasses.push('clear-both');
        break;
      case 'tight':
        baseClasses.push('clear-none');
        break;
      case 'none':
      default:
        baseClasses.push('clear-both');
        break;
    }

    return baseClasses.join(' ');
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="image-container">
      {images.map((image) => (
        <div 
          key={image.id} 
          className={getContainerClasses(image)}
          style={{
            zIndex: image.z_index || 0,
          }}
        >
          <img
            src={image.url}
            alt={image.alt_text || image.filename}
            style={getImageStyle(image)}
            className="rounded-lg shadow-sm"
            loading="lazy"
          />
          {image.alt_text && (
            <p className="text-xs text-muted-foreground text-center mt-2 italic">
              {image.alt_text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};