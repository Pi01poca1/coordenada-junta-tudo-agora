import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FileText, Eye, Upload, Image } from 'lucide-react';
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
  book_id: string;
}

export const ChapterList = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { bookId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log('ChapterList useEffect - bookId:', bookId, 'user:', user?.id);
    if (bookId) {
      fetchChapters();
    }
  }, [bookId, user]);

  const fetchChapters = async () => {
    if (!user || !bookId) {
      console.log('fetchChapters: missing user or bookId', { user: user?.id, bookId });
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching chapters for bookId:', bookId);
      setError(null);

      // Test connection and fetch chapters
      const { data, error, count } = await supabase
        .from('chapters')
        .select('*', { count: 'exact' })
        .eq('book_id', bookId)
        .order('order_index', { ascending: true });

      console.log('Supabase response:', { data, error, count });
      
      setDebugInfo({
        bookId,
        userId: user.id,
        responseData: data,
        responseError: error,
        count
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setChapters(data || []);
      console.log('Chapters loaded successfully:', data?.length);
      
    } catch (error: any) {
      console.error('Error fetching chapters:', error);
      setError(error.message || 'Failed to load chapters');
      toast({
        title: "Error",
        description: `Failed to load chapters: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMockChapter = async () => {
    if (!user || !bookId) return;

    try {
      const newChapter = {
        book_id: bookId,
        title: 'Chapter 1 - Mock Chapter',
        content: 'This is a mock chapter created for testing purposes.',
        order_index: 1,
        author_id: user.id
      };

      const { data, error } = await supabase
        .from('chapters')
        .insert([newChapter])
        .select()
        .single();

      if (error) throw error;

      setChapters([...chapters, data]);
      toast({
        title: "Success",
        description: "Mock chapter created successfully",
      });
    } catch (error: any) {
      console.error('Error creating mock chapter:', error);
      toast({
        title: "Error",
        description: `Failed to create chapter: ${error.message}`,
        variant: "destructive",
      });
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
      <div className="space-y-4">
        <div className="flex items-center justify-center min-h-32">
          <div className="text-muted-foreground">Loading chapters...</div>
        </div>
        {/* Debug info while loading */}
        {debugInfo && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Chapters</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button onClick={fetchChapters} variant="outline">
                Try Again
              </Button>
              <Button onClick={createMockChapter} variant="outline">
                Create Mock Chapter (Test)
              </Button>
            </div>
            {debugInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">Debug Info</summary>
                <pre className="text-xs mt-2 p-2 bg-white rounded border overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
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
        <div className="flex gap-2">
          <Link to={`/books/${bookId}/chapters/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Capítulo
            </Button>
          </Link>
          <Button onClick={createMockChapter} variant="outline" size="sm">
            Test Create
          </Button>
        </div>
      </div>

      {/* Show debug info if needed */}
      {debugInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm">Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              <div>Book ID: {debugInfo.bookId}</div>
              <div>User ID: {debugInfo.userId}</div>
              <div>Chapters found: {debugInfo.count}</div>
              <div>Error: {debugInfo.responseError ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {chapters.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum capítulo ainda.</h3>
              <p className="text-muted-foreground mb-4">
                Clique em 'Adicionar Capítulo' para criar o primeiro.
              </p>
              <div className="space-x-2">
                <Link to={`/books/${bookId}/chapters/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Capítulo
                  </Button>
                </Link>
                <Button onClick={createMockChapter} variant="outline">
                  Create Test Chapter
                </Button>
              </div>
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
                    <Link to={`/books/${bookId}/chapters/${chapter.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
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