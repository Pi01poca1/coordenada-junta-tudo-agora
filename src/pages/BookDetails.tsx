import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Layout/Navigation';
import { DraggableChapterList } from '@/components/Chapters/DraggableChapterList';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ExportPanel } from '@/components/Export/ExportPanel';
import { ExportTest } from '@/components/Export/ExportTest';
import { ImageUpload } from '@/components/Images/ImageUpload';
import { ImageGallery } from '@/components/Images/ImageGallery';
import { BookCoverUpload } from '@/components/Images/BookCoverUpload';
import StorageDebug from '@/components/Debug/StorageDebug';

interface Book {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const BookDetails = () => {
  const [book, setBook] = useState<Book | null>(null);
  const [chapterCount, setChapterCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshGallery, setRefreshGallery] = useState(0);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchBook(id);
    }
  }, [id, user]);

  const fetchBook = async (bookId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      setBook(data);

      // Fetch chapter count
      const { count, error: countError } = await supabase
        .from('chapters')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', bookId);

      if (!countError) {
        setChapterCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      toast({
        title: "Error",
        description: "Failed to load book or book not found",
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
            <div className="text-muted-foreground">Loading book...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Book not found</h1>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-6">
            {/* Book Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{book.title}</CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(book.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(book.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[book.status as keyof typeof statusColors] || statusColors.draft}>
                    {book.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={`/books/${book.id}/edit`}>
                  <Button className="w-full" variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Livro
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Imagens do Livro */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📸 Imagens</CardTitle>
                <CardDescription>
                  Gerencie a capa e imagens do seu livro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Capa do Livro */}
                <div>
                  <h4 className="font-medium mb-2 text-sm">🖼️ Capa do Livro</h4>
                  <BookCoverUpload 
                    bookId={book.id} 
                    onCoverUploaded={() => setRefreshGallery(prev => prev + 1)} 
                  />
                </div>
                
                {/* Outras Imagens */}
                <div>
                  <h4 className="font-medium mb-2 text-sm">📷 Outras Imagens</h4>
                  <ImageUpload 
                    bookId={book.id} 
                    onImageUploaded={() => setRefreshGallery(prev => prev + 1)} 
                  />
                </div>
                
                {/* Galeria */}
                <div>
                  <h4 className="font-medium mb-2 text-sm">🖼️ Galeria</h4>
                  <ImageGallery bookId={book.id} key={refreshGallery} />
                </div>
              </CardContent>
            </Card>

            {/* Export Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📄 Exportar Livro</CardTitle>
                <CardDescription>
                  Baixe seu livro em diferentes formatos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportPanel 
                  bookId={book.id} 
                  bookTitle={book.title}
                  totalChapters={chapterCount}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <DraggableChapterList bookId={book.id} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookDetails;