import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Layout/Navigation';
import { ImageUpload } from '@/components/Images/ImageUpload';
import { ImageGallery } from '@/components/Images/ImageGallery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Chapter {
  id: string;
  title: string;
  content: string | null;
  order_index: number | null;
  created_at: string;
  updated_at: string;
  book_id: string;
}

interface Book {
  id: string;
  title: string;
}

const ChapterDetail = () => {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const { bookId, chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (bookId && chapterId) {
      fetchChapterAndBook();
    }
  }, [bookId, chapterId, user]);

  const fetchChapterAndBook = async () => {
    if (!user || !bookId || !chapterId) return;

    try {
      // Fetch chapter
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .eq('book_id', bookId)
        .single();

      if (chapterError) throw chapterError;

      // Fetch book
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('id, title')
        .eq('id', bookId)
        .eq('owner_id', user.id)
        .single();

      if (bookError) throw bookError;

      setChapter(chapterData);
      setBook(bookData);
    } catch (error) {
      console.error('Error fetching chapter or book:', error);
      toast({
        title: "Error",
        description: "Failed to load chapter or unauthorized access",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-muted-foreground">Loading chapter...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!chapter || !book) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/books/${bookId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {book.title}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">
                        Chapter {chapter.order_index || 1}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">{chapter.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(chapter.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDistanceToNow(new Date(chapter.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Link to={`/books/${bookId}/chapters/${chapterId}/edit`}>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Chapter
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              {chapter.content && (
                <CardContent>
                  <div className="prose max-w-none">
                    {chapter.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUpload chapterId={chapterId} onImageUploaded={() => window.location.reload()} />
                <ImageGallery chapterId={chapterId} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Chapter Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Book</div>
                  <div className="text-sm">{book.title}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Order</div>
                  <div className="text-sm">Chapter {chapter.order_index || 1}</div>
                </div>
                {chapter.content && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Estimated reading time</div>
                    <div className="text-sm">{Math.ceil(chapter.content.length / 250)} minutes</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChapterDetail;