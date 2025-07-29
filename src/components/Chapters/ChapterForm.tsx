import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AIPanel } from '@/components/AI/AIPanel';
import { InlineImageEditor } from '@/components/Images/InlineImageEditor';
import { 
  ArrowLeft, Sparkles, Eye, Edit3, Settings, FileImage, 
  Type, RotateCcw, X, Save
} from 'lucide-react';

interface Image {
  id: string;
  url: string;
  filename: string;
  position_x: number | null;
  position_y: number | null;
  scale: number | null;
  text_wrap: string | null;
  layout: string | null;
  z_index: number | null;
  alt_text?: string | null;
  chapter_id: string;
  book_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Removido o InlineImageEditor local, usando o importado

export const ChapterForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [book, setBook] = useState<any>(null);

  const [activeTab, setActiveTab] = useState('edit');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [images, setImages] = useState<Image[]>([]);
  const [imageLoading, setImageLoading] = useState(false);

  const { bookId, chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
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
      fetchChapterImages(chapterId);
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

  const fetchChapterImages = async (chapterId: string) => {
    setImageLoading(true);
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching chapter images:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar imagens do capítulo",
        variant: "destructive"
      });
    } finally {
      setImageLoading(false);
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

  const handleUpdateImage = async (imageId: string, updates: Partial<Image>) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ));

    try {
      const { error } = await supabase
        .from('images')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', imageId);

      if (error) throw error;

      setTimeout(() => {
        toast({
          title: "✓ Salvo",
          description: "Alteração salva automaticamente"
        });
      }, 500);

    } catch (error) {
      console.error('Error updating image:', error);
      
      setImages(prev => {
        const originalImage = prev.find(img => img.id === imageId);
        if (originalImage) {
          return prev.map(img => img.id === imageId ? originalImage : img);
        }
        return prev;
      });
      
      toast({
        title: "Erro",
        description: "Falha ao salvar. Tente novamente.",
        variant: "destructive"
      });
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Assistant
            </Button>
            {activeTab === 'preview' && (
              <Button
                variant={editMode ? "default" : "outline"}
                onClick={() => {
                  setEditMode(!editMode);
                  if (!editMode) setSelectedImageId(null);
                }}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                {editMode ? 'Sair da Edição' : 'Editar Imagens'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Editar Texto
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview com Imagens ({images.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6">
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
                        <Save className="h-4 w-4 mr-2" />
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
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {imageLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando imagens...</span>
            </div>
          ) : (
            <InlineImageEditor
              images={images}
              selectedImageId={selectedImageId}
              onSelectImage={setSelectedImageId}
              onUpdate={() => fetchChapterImages(chapterId!)}
              editMode={editMode}
              chapterContent={content}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};