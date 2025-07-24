import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, FileText, Calendar, TrendingUp, Download, Zap, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface Stats {
  totalBooks: number;
  totalChapters: number;
  totalWords: number;
  totalExports: number;
  totalAISessions: number;
  draftBooks: number;
  publishedBooks: number;
  averageWordsPerChapter: number;
  averageChaptersPerBook: number;
  mostProductiveDay: string;
  weeklyActivity: Array<{
    date: string;
    chapters: number;
    words: number;
  }>;
  recentActivity: Array<{
    type: 'book' | 'chapter' | 'export' | 'ai';
    title: string;
    date: string;
  }>;
}

export default function Statistics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalChapters: 0,
    totalWords: 0,
    totalExports: 0,
    totalAISessions: 0,
    draftBooks: 0,
    publishedBooks: 0,
    averageWordsPerChapter: 0,
    averageChaptersPerBook: 0,
    mostProductiveDay: '',
    weeklyActivity: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Buscar estatísticas de livros
      const { data: books } = await supabase
        .from('books')
        .select('id, title, status, created_at')
        .eq('owner_id', user.id);

      // Buscar estatísticas de capítulos
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id, title, content, created_at, book_id')
        .eq('author_id', user.id);

      // Buscar sessões de IA
      const { data: aiSessions } = await supabase
        .from('ai_sessions')
        .select('id, created_at, provider')
        .eq('user_id', user.id);

      // Calcular estatísticas
      const totalBooks = books?.length || 0;
      const totalChapters = chapters?.length || 0;
      const draftBooks = books?.filter(book => book.status === 'draft').length || 0;
      const publishedBooks = books?.filter(book => book.status === 'published').length || 0;
      const totalAISessions = aiSessions?.length || 0;

      // Calcular total de palavras e médias
      const chaptersWithWords = chapters?.map(ch => ({
        ...ch,
        wordCount: ch.content ? ch.content.split(/\s+/).length : 0
      })) || [];

      const totalWords = chaptersWithWords.reduce((total, ch) => total + ch.wordCount, 0);
      const averageWordsPerChapter = totalChapters > 0 ? Math.round(totalWords / totalChapters) : 0;
      const averageChaptersPerBook = totalBooks > 0 ? Math.round(totalChapters / totalBooks) : 0;

      // Atividade semanal
      const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
      });

      const weeklyActivity = last7Days.map(date => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const dayChapters = chapters?.filter(ch => {
          const chapterDate = new Date(ch.created_at);
          return chapterDate >= dayStart && chapterDate <= dayEnd;
        }) || [];

        const dayWords = dayChapters.reduce((sum, ch) => 
          sum + (ch.content ? ch.content.split(/\s+/).length : 0), 0
        );

        return {
          date: format(date, 'MMM dd'),
          chapters: dayChapters.length,
          words: dayWords
        };
      });

      const mostProductiveDay = weeklyActivity.reduce((most, current) => 
        current.words > most.words ? current : most, 
        weeklyActivity[0]
      )?.date || '';

      // Atividade recente
      const recentActivity = [
        ...((books || []).map(book => ({
          type: 'book' as const,
          title: `Livro: ${book.title}`,
          date: book.created_at
        }))),
        ...((chapters || []).map(chapter => ({
          type: 'chapter' as const,
          title: `Capítulo: ${chapter.title}`,
          date: chapter.created_at
        }))),
        ...((aiSessions || []).map(session => ({
          type: 'ai' as const,
          title: `Sessão IA: ${session.provider || 'Sistema'}`,
          date: session.created_at
        })))
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      setStats({
        totalBooks,
        totalChapters,
        totalWords,
        totalExports: 0, // Por enquanto 0, pode ser implementado depois
        totalAISessions,
        draftBooks,
        publishedBooks,
        averageWordsPerChapter,
        averageChaptersPerBook,
        mostProductiveDay,
        weeklyActivity,
        recentActivity
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpen className="h-4 w-4" />;
      case 'chapter': return <FileText className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'ai': return <Zap className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">Carregando estatísticas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Estatísticas</h1>
              <p className="text-muted-foreground">Acompanhe seu progresso como escritor</p>
            </div>
          </div>
        </div>

        {/* Cards de estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Livros</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
              <div className="flex space-x-2 mt-2">
                <Badge variant="secondary">{stats.draftBooks} rascunhos</Badge>
                <Badge variant="default">{stats.publishedBooks} publicados</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Capítulos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChapters}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Capítulos criados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Palavras</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Palavras escritas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões de IA</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAISessions}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Assistência utilizada
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Médias de Escrita</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold">
                  {stats.averageWordsPerChapter.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Palavras por capítulo</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.averageChaptersPerBook}
                </div>
                <p className="text-sm text-muted-foreground">Capítulos por livro</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Produtividade</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-xl font-bold">
                  {stats.mostProductiveDay || 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">Dia mais produtivo (esta semana)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Atividade Semanal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end space-x-1 h-20">
                  {stats.weeklyActivity.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-primary/20 rounded-t"
                        style={{ 
                          height: `${Math.max(day.words / Math.max(...stats.weeklyActivity.map(d => d.words), 1) * 100, 5)}%` 
                        }}
                      >
                        <div 
                          className="w-full bg-primary rounded-t"
                          style={{ 
                            height: `${Math.max(day.chapters / Math.max(...stats.weeklyActivity.map(d => d.chapters), 1) * 100, 10)}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs mt-1 text-center">
                        <div>{day.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded" />
                    <span>Capítulos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary/20 rounded" />
                    <span>Palavras</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Atividade recente */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma atividade recente encontrada
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center space-x-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {activity.type === 'ai' ? 'IA' : activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}