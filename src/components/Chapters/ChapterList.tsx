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

export const ChapterList = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authDebug, setAuthDebug] = useState<any>(null);
  const [queryDebug, setQueryDebug] = useState<any>(null);
  
  const { bookId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    debugAuthentication();
    if (bookId && user) {
      fetchChapters();
    } else {
      setLoading(false);
    }
  }, [bookId, user]);

  const debugAuthentication = async () => {
    console.log('🔐 Starting authentication debug...');
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      let dbTestResult = null;
      try {
        // Test simple query without count
        const { data: testData, error: testError } = await supabase
          .from('books')
          .select('id')
          .limit(1);
        
        dbTestResult = {
          success: !testError,
          error: testError?.message,
          hasData: !!testData
        };
      } catch (dbError: any) {
        dbTestResult = {
          success: false,
          error: dbError.message,
          hasData: false
        };
      }

      const authDebugInfo = {
        timestamp: new Date().toISOString(),
        contextUser: {
          exists: !!user,
          id: user?.id,
          email: user?.email
        },
        supabaseSession: {
          exists: !!sessionData.session,
          user: sessionData.session?.user?.id,
          error: sessionError?.message
        },
        supabaseUser: {
          exists: !!userData.user,
          id: userData.user?.id,
          email: userData.user?.email,
          error: userError?.message
        },
        databaseTest: dbTestResult
      };

      setAuthDebug(authDebugInfo);
      console.log('🔐 Auth debug completed:', authDebugInfo);
      
    } catch (error: any) {
      console.error('❌ Auth debug failed:', error);
      setAuthDebug({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  const fetchChapters = async () => {
    console.log('📚 Starting fetchChapters (without count)...');
    
    if (!user || !bookId) {
      console.log('❌ Missing requirements:', { user: !!user, bookId });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('🔍 Querying chapters table (simple query)...');

      // Simple query without count to avoid parsing issues
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true });

      const debugData = {
        query: {
          table: 'chapters',
          filter: `book_id = ${bookId}`,
          timestamp: new Date().toISOString(),
          method: 'simple_select_without_count'
        },
        response: {
          hasData: !!data,
          dataCount: data?.length || 0,
          hasError: !!error,
          errorMessage: error?.message,
          errorCode: error?.code,
          errorDetails: error?.details,
          errorHint: error?.hint
        }
      };

      setQueryDebug(debugData);
      console.log('📊 Query debug:', debugData);

      if (error) {
        console.error('❌ Supabase query error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      setChapters(data || []);
      console.log('✅ Chapters loaded:', data?.length || 0);
      
    } catch (error: any) {
      console.error('💥 fetchChapters error:', error);
      setError(error.message);
      
      toast({
        title: "❌ Erro ao Carregar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestChapter = async () => {
    if (!user || !bookId) return;

    try {
      const testChapter = {
        book_id: bookId,
        title: `Test Chapter ${Date.now()}`,
        content: 'This is a test chapter for debugging.',
        order_index: chapters.length + 1,
      };

      console.log('🧪 Creating test chapter:', testChapter);

      const { data, error } = await supabase
        .from('chapters')
        .insert([testChapter])
        .select()
        .single();

      if (error) throw error;

      setChapters([...chapters, data]);
      toast({
        title: "✅ Sucesso!",
        description: "Capítulo de teste criado",
      });
    } catch (error: any) {
      console.error('❌ Test chapter error:', error);
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderAuthStatus = () => {
    if (!authDebug) return null;

    const isAuthenticated = authDebug.contextUser?.exists && authDebug.supabaseSession?.exists;
    const hasDbAccess = authDebug.databaseTest?.success;

    return (
      <Card className={`${isAuthenticated && hasDbAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <CardHeader>
          <CardTitle className={`text-sm flex items-center ${isAuthenticated && hasDbAccess ? 'text-green-800' : 'text-red-800'}`}>
            {isAuthenticated && hasDbAccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Context User:</strong> {authDebug.contextUser?.exists ? '✅' : '❌'}
                {authDebug.contextUser?.id && <div>ID: {authDebug.contextUser.id.substring(0, 8)}...</div>}
              </div>
              <div>
                <strong>Supabase Session:</strong> {authDebug.supabaseSession?.exists ? '✅' : '❌'}
                {authDebug.supabaseSession?.error && <div className="text-red-600">Error: {authDebug.supabaseSession.error}</div>}
              </div>
              <div>
                <strong>Database Access:</strong> {hasDbAccess ? '✅' : '❌'}
                {authDebug.databaseTest?.error && <div className="text-red-600">Error: {authDebug.databaseTest.error}</div>}
              </div>
              <div>
                <strong>Book ID:</strong> {bookId ? '✅' : '❌'}
                {bookId && <div>{bookId.substring(0, 8)}...</div>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center min-h-32">
          <div className="text-muted-foreground">🔄 Loading chapters...</div>
        </div>
        {renderAuthStatus()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Authentication Debug */}
      {renderAuthStatus()}

      {/* Query Debug */}
      {queryDebug && (
        <Card className={`${queryDebug.response?.hasError ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <CardHeader>
            <CardTitle className={`text-sm ${queryDebug.response?.hasError ? 'text-red-800' : 'text-blue-800'}`}>
              📊 Database Query Debug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              <div><strong>Table:</strong> {queryDebug.query?.table}</div>
              <div><strong>Method:</strong> {queryDebug.query?.method}</div>
              <div><strong>Filter:</strong> {queryDebug.query?.filter}</div>
              <div><strong>Found:</strong> {queryDebug.response?.dataCount} chapters</div>
              <div><strong>Error:</strong> {queryDebug.response?.hasError ? 'Yes' : 'No'}</div>
              {queryDebug.response?.errorMessage && (
                <div className="text-red-600"><strong>Error Message:</strong> {queryDebug.response.errorMessage}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
              <Button onClick={createTestChapter} variant="outline">
                🧪 Create Test Chapter
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
          <Button onClick={createTestChapter} variant="outline" size="sm">
            <TestTube className="h-4 w-4 mr-2" />
            Test Create
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
                The chapters table exists but no chapters found for this book.
              </p>
              <div className="flex gap-2 justify-center">
                <Link to={`/books/${bookId}/chapters/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </Link>
                <Button onClick={createTestChapter} variant="outline">
                  <TestTube className="h-4 w-4 mr-2" />
                  Create Test
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