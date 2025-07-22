import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Sparkles, Image, History, Copy } from 'lucide-react';
import { useAI, type AIGoal } from '@/hooks/useAI';
import { useToast } from '@/hooks/use-toast';

interface AIPanelProps {
  chapterId: string;
  selectedText?: string;
  onTextReplace?: (newText: string) => void;
  genre?: string;
}

export const AIPanel = ({ chapterId, selectedText = '', onTextReplace, genre }: AIPanelProps) => {
  const [currentText, setCurrentText] = useState(selectedText);
  const [enrichResult, setEnrichResult] = useState<any>(null);
  const [promptResult, setPromptResult] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<AIGoal>('improve');
  const [promptContext, setPromptContext] = useState({
    genre: genre || 'fantasia',
    mood: 'neutral',
    style: 'realistic'
  });
  const [history, setHistory] = useState<any[]>([]);

  const { enrichText, generatePrompt, getAIHistory, isLoading } = useAI();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentText(selectedText);
  }, [selectedText]);

  useEffect(() => {
    loadHistory();
  }, [chapterId]);

  const loadHistory = async () => {
    const data = await getAIHistory(chapterId);
    setHistory(data);
  };

  const handleEnrich = async () => {
    if (!currentText.trim()) {
      toast({
        title: "Erro",
        description: "Digite ou selecione um texto para enriquecer",
        variant: "destructive"
      });
      return;
    }

    const result = await enrichText(chapterId, currentText, selectedGoal);
    if (result) {
      setEnrichResult(result);
      loadHistory(); // Reload history
    }
  };

  const handleGeneratePrompt = async () => {
    if (!currentText.trim()) {
      toast({
        title: "Erro",
        description: "Digite ou selecione um texto para gerar prompt",
        variant: "destructive"
      });
      return;
    }

    const result = await generatePrompt(chapterId, currentText, promptContext);
    if (result) {
      setPromptResult(result);
      loadHistory(); // Reload history
    }
  };

  const handleApplyEnrichment = () => {
    if (enrichResult && onTextReplace) {
      onTextReplace(enrichResult.enrichedText);
      toast({
        title: "Texto aplicado!",
        description: "O texto enriquecido foi aplicado ao capítulo",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  const goalDescriptions = {
    improve: "Melhorar qualidade geral do texto",
    ideas: "Gerar ideias e sugestões criativas",
    expand: "Expandir e adicionar detalhes",
    grammar: "Corrigir gramática e ortografia",
    style: "Melhorar estilo literário"
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Assistente IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="enrich" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="enrich">Enriquecer</TabsTrigger>
            <TabsTrigger value="prompt">Prompt Imagem</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="enrich" className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Texto para enriquecer:</label>
              <Textarea
                placeholder="Cole ou digite o texto que deseja enriquecer..."
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Objetivo:</label>
              <Select value={selectedGoal} onValueChange={(value: AIGoal) => setSelectedGoal(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(goalDescriptions).map(([key, description]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium capitalize">{key}</div>
                        <div className="text-xs text-muted-foreground">{description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleEnrich} 
              disabled={isLoading || !currentText.trim()}
              className="w-full"
            >
              {isLoading ? 'Processando...' : 'Enriquecer Texto'}
            </Button>

            {enrichResult && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Resultado</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      +{enrichResult.wordCountAfter - enrichResult.wordCountBefore} palavras
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScrollArea className="h-32 w-full rounded border p-3 text-sm">
                    {enrichResult.enrichedText}
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleApplyEnrichment}>
                      Aplicar ao Capítulo
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(enrichResult.enrichedText)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Texto base:</label>
              <Textarea
                placeholder="Descreva a cena para gerar prompt de imagem..."
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium">Gênero</label>
                <Select 
                  value={promptContext.genre} 
                  onValueChange={(value) => setPromptContext(prev => ({ ...prev, genre: value }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fantasia">Fantasia</SelectItem>
                    <SelectItem value="ficção científica">Ficção Científica</SelectItem>
                    <SelectItem value="romance">Romance</SelectItem>
                    <SelectItem value="terror">Terror</SelectItem>
                    <SelectItem value="aventura">Aventura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium">Atmosfera</label>
                <Select 
                  value={promptContext.mood} 
                  onValueChange={(value) => setPromptContext(prev => ({ ...prev, mood: value }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Sombrio</SelectItem>
                    <SelectItem value="bright">Luminoso</SelectItem>
                    <SelectItem value="mysterious">Misterioso</SelectItem>
                    <SelectItem value="neutral">Neutro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium">Estilo</label>
                <Select 
                  value={promptContext.style} 
                  onValueChange={(value) => setPromptContext(prev => ({ ...prev, style: value }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realista</SelectItem>
                    <SelectItem value="artistic">Artístico</SelectItem>
                    <SelectItem value="cinematic">Cinematográfico</SelectItem>
                    <SelectItem value="fantasy">Fantasia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGeneratePrompt} 
              disabled={isLoading || !currentText.trim()}
              className="w-full"
            >
              <Image className="h-4 w-4 mr-2" />
              {isLoading ? 'Gerando...' : 'Gerar Prompt'}
            </Button>

            {promptResult && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Prompt Gerado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded text-sm">
                    {promptResult.prompt}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(promptResult.prompt)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar Prompt
                  </Button>
                  
                  {promptResult.suggestions && promptResult.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <Separator />
                      <label className="text-xs font-medium">Sugestões alternativas:</label>
                      {promptResult.suggestions.map((suggestion: string, index: number) => (
                        <div key={index} className="p-2 bg-muted/50 rounded text-xs">
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <History className="h-4 w-4" />
              Últimas {history.length} atividades de IA
            </div>
            
            <ScrollArea className="h-64 w-full">
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 text-center">
                    <AlertCircle className="h-4 w-4" />
                    Nenhuma atividade de IA ainda
                  </div>
                ) : (
                  history.map((item, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.provider}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium mb-1">{item.input_prompt}</div>
                        {item.output_content && (
                          <div className="text-muted-foreground text-xs">
                            {item.output_content.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};