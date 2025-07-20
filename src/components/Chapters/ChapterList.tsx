import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Chapter {
  id: string;
  title: string;
  content: string | null;
  order_index: number | null;
  created_at: string;
  updated_at: string;
}

export const ChapterList = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { bookId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (bookId) {
      fetchChapters();
    }
  }, [bookId, user]);

  const fetchChapters = async () => {
    if (!user || !bookId) return;

    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast({
        title: "Error",
        description: "Failed to load chapters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setChapters(chapters.filter(chapter => chapter.id !== id));
      toast({
        title: "Success",
        description: "Chapter deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast({
        title: "Error",
        description: "Failed to delete chapter",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <div className="text-muted-foreground">Loading chapters...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chapters</h2>
          <p className="text-muted-foreground">Organize your book content</p>
        </div>
        <Link to={`/books/${bookId}/chapters/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Chapter
          </Button>
        </Link>
      </div>

      {chapters.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chapters yet</h3>
              <p className="text-muted-foreground mb-4">
                Start writing by adding your first chapter
              </p>
              <Link to={`/books/${bookId}/chapters/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Chapter
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter, index) => (
            <Card key={chapter.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Chapter {chapter.order_index || index + 1}
                      </Badge>
                      <CardTitle className="text-lg">{chapter.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      Last updated {formatDistanceToNow(new Date(chapter.updated_at), { addSuffix: true })}
                      {chapter.content && (
                        <span className="ml-2">
                          • {Math.ceil(chapter.content.length / 250)} min read
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/books/${bookId}/chapters/${chapter.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDeleteId(chapter.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {chapter.content && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {chapter.content.substring(0, 150)}...
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chapter? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Chapter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};