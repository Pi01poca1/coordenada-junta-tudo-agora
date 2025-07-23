import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AIPanel } from '@/components/AI/AIPanel';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const ChapterForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [book, setBook] = useState<any>(null);

  const { bookId, chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if bookId is valid
    if (!bookId || bookId === 'undefined') {
      toast({
        title: "Erro",
        description: "ID do livro inválido. Redirecionando...",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    if (chapterId && chapterId !== 'new') {
      setIsEdit(true);
      fetchChapter(chapterId);
    } else {
      fetchNextOrderIndex();
    }
    
    fetchBook();
  }, [chapterId, bookId, navigate, toast]);

  const fetchBook = async () => {
    if (!bookId) return;
    
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (error) throw error;
      setBook(data);
    } catch (error) {
      console.error('Error fetching book:', error);
    }
  };

  const fetchChapter = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .eq('book_id', bookId)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setContent(data.content || '');
        setOrderIndex(data.order_index || 1);
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      toast({
        title: "Error",
        description: "Failed to load chapter",
        variant: "destructive",
      });
      navigate(`/books/${bookId}`);
    }
  };

  const fetchNextOrderIndex = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('order_index')
        .eq('book_id', bookId)
        .order('order_index', { ascending: false })
        .limit(1);

      if (error) throw error;

      const lastOrder = data?.[0]?.order_index || 0;
      setOrderIndex(lastOrder + 1);
    } catch (error) {
      console.error('Error fetching order index:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !bookId) return;

    setLoading(true);

    try {
      if (isEdit && chapterId) {
        const { error } = await supabase
          .from('chapters')
          .update({
            title,
            content,
            order_index: orderIndex,
            updated_at: new Date().toISOString(),
          })
          .eq('id', chapterId)
          .eq('book_id', bookId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('chapters')
          .insert({
            title,
            content,
            order_index: orderIndex,
            book_id: bookId,
            author_id: user.id,
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Chapter ${isEdit ? 'updated' : 'created'} successfully`,
      });

      navigate(`/books/${bookId}`);
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} chapter`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTextSelection = () => {
    const textarea = document.querySelector('textarea[id="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = content.substring(start, end);
      if (selected.trim()) {
        setSelectedText(selected);
        setShowAIPanel(true);
      }
    }
  };

  const handleTextReplace = (newText: string) => {
    if (selectedText) {
      const newContent = content.replace(selectedText, newText);
      setContent(newContent);
      setSelectedText('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/books/${bookId}`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Book
            </Button>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Edit Chapter' : 'New Chapter'}
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit Chapter' : 'Chapter Details'}</CardTitle>
              <CardDescription>
                {isEdit ? 'Update your chapter content' : 'Write your new chapter'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title">Chapter Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Enter chapter title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Chapter Order</Label>
                    <Input
                      id="order"
                      type="number"
                      min="1"
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Content</Label>
                    {showAIPanel && (
                      <div className="text-xs text-muted-foreground">
                        Select text and use AI Assistant →
                      </div>
                    )}
                  </div>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onMouseUp={handleTextSelection}
                    placeholder="Start writing your chapter..."
                    rows={20}
                    className="min-h-[400px] font-serif text-base leading-relaxed"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (isEdit ? 'Update Chapter' : 'Create Chapter')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(`/books/${bookId}`)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {showAIPanel && chapterId && chapterId !== 'new' && (
          <div className="lg:col-span-1">
            <AIPanel 
              chapterId={chapterId}
              selectedText={selectedText}
              onTextReplace={handleTextReplace}
              genre={book?.description || 'fantasy'}
            />
          </div>
        )}
        
        {showAIPanel && (!chapterId || chapterId === 'new') && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Save the chapter first to use AI features.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
