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
import { ArrowLeft } from 'lucide-react';

export const ChapterForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const { bookId, chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (chapterId && chapterId !== 'new') {
      setIsEdit(true);
      fetchChapter(chapterId);
    } else {
      fetchNextOrderIndex();
    }
  }, [chapterId, bookId]);

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
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
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
  );
};
