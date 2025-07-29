import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FileText, Eye, GripVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Chapter {
  id: string;
  title: string;
  content: string | null;
  order_index: number | null;
  created_at: string;
  updated_at: string;
  book_id: string;
}

interface SortableChapterProps {
  chapter: Chapter;
  bookId: string;
}

const SortableChapter = ({ chapter, bookId }: SortableChapterProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={`transition-all ${isDragging ? 'shadow-lg scale-105' : ''}`}>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div
          className="flex items-center cursor-grab active:cursor-grabbing mr-3 p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{chapter.title}</CardTitle>
          <CardDescription>
            {chapter.content ? 
              `${chapter.content.substring(0, 100)}${chapter.content.length > 100 ? '...' : ''}` : 
              'Sem conteúdo ainda'
            }
          </CardDescription>
        </div>
        <Badge variant="outline" className="ml-2">
          #{chapter.order_index || 0}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Atualizado {formatDistanceToNow(new Date(chapter.updated_at), { addSuffix: true })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/books/${bookId}/chapters/${chapter.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/books/${bookId}/chapters/${chapter.id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DraggableChapterListProps {
  bookId?: string;
}

export const DraggableChapterList = ({ bookId: propBookId }: DraggableChapterListProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const { bookId: paramBookId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const bookId = propBookId || paramBookId;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchChapters = async () => {
    if (!bookId || !user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Erro ao carregar capítulos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar capítulos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [bookId, user]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = chapters.findIndex((chapter) => chapter.id === active.id);
      const newIndex = chapters.findIndex((chapter) => chapter.id === over?.id);

      const newChapters = arrayMove(chapters, oldIndex, newIndex);
      setChapters(newChapters);

      // Atualizar order_index no banco
      try {
        const updates = newChapters.map((chapter, index) => ({
          id: chapter.id,
          order_index: index + 1
        }));

        for (const update of updates) {
          await supabase
            .from('chapters')
            .update({ order_index: update.order_index })
            .eq('id', update.id);
        }

        toast({
          title: "Sucesso",
          description: "Ordem dos capítulos atualizada"
        });
      } catch (error) {
        console.error('Erro ao atualizar ordem:', error);
        toast({
          title: "Erro",
          description: "Falha ao salvar nova ordem",
          variant: "destructive"
        });
        // Reverter mudança local
        fetchChapters();
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando capítulos...</div>;
  }

  if (!chapters.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Nenhum capítulo encontrado</p>
          <Button asChild>
            <Link to={`/books/${bookId}/chapters/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Capítulo
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Capítulos</h2>
        <Button asChild>
          <Link to={`/books/${bookId}/chapters/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Capítulo
          </Link>
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={chapters.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <SortableChapter
                key={chapter.id}
                chapter={chapter}
                bookId={bookId!}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};