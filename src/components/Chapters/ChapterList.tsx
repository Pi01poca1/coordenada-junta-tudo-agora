import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FileText, Eye, TestTube, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Chapter {
  id: string;
  title: string;
  content: string | null;
  order_index: number | null;
  created_at: string;
  updated_at: string;
  book_id: string;
}

interface ChapterListProps {
  bookId?: string;
}

export const ChapterList = ({ bookId: propBookId }: ChapterListProps) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const { bookId: paramBookId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  // Use prop bookId if provided, otherwise use param bookId
  const bookId = propBookId || paramBookId;

  // Helper function to add debug logs
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('🔍 DEBUG:', logMessage);
    setDebugLogs(prev => [...prev.slice(-10), logMessage]); // Keep last 10 logs
  };

  useEffect(() => {
    addDebugLog('ChapterList component mounted');
    addDebugLog(`propBookId: ${propBookId}, paramBookId: ${paramBookId}, final bookId: ${bookId}, user: ${user?.id}`);
    
    if (bookId && user) {
      fetchChapters();
    } else {
      addDebugLog('Missing bookId or user, skipping fetch');
      setLoading(false);
    }
  }, [bookId, user, propBookId, paramBookId]);

  const fetchChapters = async () => {
    addDebugLog('Starting fetchChapters');
    
    if (!user || !bookId) {
      addDebugLog('fetchChapters aborted: missing user or bookId');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      addDebugLog('Executing Supabase query...');

      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true });

      addDebugLog(`Query completed. Data: ${data?.length || 0} chapters, Error: ${error?.message || 'none'}`);

      if (error) {
        addDebugLog(`Supabase error: ${error.message}`);
        throw new Error(`Database error: ${error.message}`);
      }

      setChapters(data || []);
      addDebugLog(`Chapters set in state: ${data?.length || 0}`);
      
    } catch (error: any) {
      addDebugLog(`fetchChapters error: ${error.message}`);
      setError(error.message);
      
      toast({
        title: "❌ Erro ao Carregar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      addDebugLog('fetchChapters completed, loading set to false');
    }
  };

  const createTestChapter = async () => {
    addDebugLog('🧪 createTestChapter function called!');
    
    if (!user || !bookId) {
      addDebugLog('❌ Cannot create: missing user or bookId');
      toast({
        title: "❌ Erro",
        description: "User or Book ID missing",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      addDebugLog('Starting chapter creation...');

      const testChapter = {
        book_id: bookId,
        title: `Test Chapter ${Date.now()}`,
        content: 'This is a test chapter created for debugging purposes.',
        order_index: chapters.length + 1,
      };

      addDebugLog(`Test chapter data: ${JSON.stringify(testChapter)}`);

      const { data, error } = await supabase
        .from('chapters')
        .insert([testChapter])
        .select()
        .single();

      addDebugLog(`Insert result - Data: ${!!data}, Error: ${error?.message || 'none'}`);

      if (error) {
        addDebugLog(`❌ Insert error: ${JSON.stringify(error)}`);
        throw error;
      }

      addDebugLog('✅ Chapter created successfully!');
      setChapters([...chapters, data]);
      
      toast({
        title: "✅ Sucesso!",
        description: "Capítulo de teste criado com sucesso!",
      });

      addDebugLog('Toast shown, function completed');
    } catch (error: any) {
      addDebugLog(`❌ createTestChapter error: ${error.message}`);
      console.error('💥 Full error object:', error);
      
      toast({
        title: "❌ Erro",
        description: `Falha ao criar capítulo: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      addDebugLog('createTestChapter finally block executed');
    }
  };

  const testButtonClick = () => {
    addDebugLog('🔘 Test button clicked!');
    alert('Button click detected! Check console for detailed logs.');
    createTestChapter();
  };

  const clearLogs = () => {
    setDebugLogs([]);
    addDebugLog('Debug logs cleared');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center min-h-32">
          <div className="text-muted-foreground">🔄 Loading chapters...</div>
        </div>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">🔄 Loading State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              {debugLogs.map((log, index) => (
                <div key={index} className="font-mono">{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debug Logs Card */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-purple-800">🔍 Debug Logs</CardTitle>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {debugLogs.length === 0 ? (
              <div>No logs yet...</div>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index} className="font-mono text-purple-700">{log}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm text-blue-800">📊 Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-1 text-blue-700">
            <div><strong>Book ID:</strong> {bookId || 'MISSING'}</div>
            <div><strong>User ID:</strong> {user?.id || 'MISSING'}</div>
            <div><strong>Chapters Count:</strong> {chapters.length}</div>
            <div><strong>Is Creating:</strong> {isCreating ? 'YES' : 'NO'}</div>
            <div><strong>Error:</strong> {error || 'None'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">❌ Error Loading Chapters</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={fetchChapters} variant="outline">
                🔄 Try Again
              </Button>
              <Button onClick={testButtonClick} variant="outline" disabled={isCreating}>
                🧪 Test Create {isCreating && '(Creating...)'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📚 Chapters</h2>
          <p className="text-muted-foreground">Organize your book content</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/books/${bookId}/chapters/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Capítulo
            </Button>
          </Link>
          <Button 
            onClick={testButtonClick} 
            variant="outline" 
            size="sm"
            disabled={isCreating}
            className="bg-yellow-100 hover:bg-yellow-200"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isCreating ? '⏳ Creating...' : 'Test Create'}
          </Button>
        </div>
      </div>

      {/* Chapters Content */}
      {!error && chapters.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">📝 No chapters found</h3>
              <p className="text-muted-foreground mb-4">
                No chapters found for this book. Try creating one!
              </p>
              <div className="flex gap-2 justify-center">
                <Link to={`/books/${bookId}/chapters/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </Link>
                <Button 
                  onClick={testButtonClick} 
                  variant="outline"
                  disabled={isCreating}
                  className="bg-green-100 hover:bg-green-200"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isCreating ? '⏳ Creating...' : 'Create Test Chapter'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : !error && chapters.length > 0 ? (
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
      ) : null}
    </div>
  );
};