import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Book, Code, Globe, Database } from 'lucide-react';
import { useExport, type ExportFormat } from '@/hooks/useExport';

interface ExportPanelProps {
  bookId: string;
  bookTitle: string;
  totalChapters: number;
}

const formatIcons = {
  pdf: FileText,
  epub: Book,
  docx: FileText,
  html: Globe,
  json: Database
};

const formatDescriptions = {
  pdf: 'Documento portátil ideal para impressão',
  epub: 'Formato de e-book compatível com leitores',
  docx: 'Documento Word para edição',
  html: 'Página web para visualização online',
  json: 'Dados estruturados para desenvolvimento'
};

export const ExportPanel = ({ bookId, bookTitle, totalChapters }: ExportPanelProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [includeImages, setIncludeImages] = useState(true);
  const [template, setTemplate] = useState('default');
  const [chapterStart, setChapterStart] = useState(1);
  const [chapterEnd, setChapterEnd] = useState(totalChapters);
  const [useRange, setUseRange] = useState(false);

  const { exportBook, isExporting } = useExport();

  const handleExport = async () => {
    const options = {
      template,
      includeImages,
      ...(useRange && { 
        chapterRange: { 
          start: chapterStart, 
          end: chapterEnd 
        } 
      })
    };

    await exportBook(bookId, selectedFormat, options);
  };

  const Icon = formatIcons[selectedFormat];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Livro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <Label>Formato de Exportação</Label>
          <Select value={selectedFormat} onValueChange={(value: ExportFormat) => setSelectedFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(formatDescriptions).map(([format, description]) => {
                const FormatIcon = formatIcons[format as ExportFormat];
                return (
                  <SelectItem key={format} value={format}>
                    <div className="flex items-center gap-2">
                      <FormatIcon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{format.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">{description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Icon className="h-4 w-4" />
            <span className="text-sm">{formatDescriptions[selectedFormat]}</span>
          </div>
        </div>

        <Separator />

        {/* Template Selection */}
        {(selectedFormat === 'pdf' || selectedFormat === 'html' || selectedFormat === 'docx') && (
          <div className="space-y-3">
            <Label>Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão - Simples e elegante</SelectItem>
                <SelectItem value="professional">Profissional - Estrutura completa</SelectItem>
                <SelectItem value="abnt">ABNT - Padrão acadêmico brasileiro</SelectItem>
                <SelectItem value="academic">Acadêmico - Estilo universitário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          <Label>Opções</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeImages" 
              checked={includeImages}
              onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
            />
            <label 
              htmlFor="includeImages" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Incluir imagens
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="useRange" 
              checked={useRange}
              onCheckedChange={(checked) => setUseRange(checked as boolean)}
            />
            <label 
              htmlFor="useRange" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Exportar apenas alguns capítulos
            </label>
          </div>

          {useRange && (
            <div className="ml-6 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start" className="text-xs">Capítulo inicial</Label>
                <Input
                  id="start"
                  type="number"
                  min={1}
                  max={totalChapters}
                  value={chapterStart}
                  onChange={(e) => setChapterStart(parseInt(e.target.value) || 1)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="end" className="text-xs">Capítulo final</Label>
                <Input
                  id="end"
                  type="number"
                  min={chapterStart}
                  max={totalChapters}
                  value={chapterEnd}
                  onChange={(e) => setChapterEnd(parseInt(e.target.value) || totalChapters)}
                  className="h-8"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Export Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          <div>📖 <strong>{bookTitle}</strong></div>
          <div>📄 {useRange ? `Capítulos ${chapterStart}-${chapterEnd}` : `${totalChapters} capítulos`}</div>
          <div>📁 Formato: {selectedFormat.toUpperCase()}</div>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar {selectedFormat.toUpperCase()}
            </>
          )}
        </Button>

        {/* Quick Export Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedFormat('pdf');
              setTemplate('default');
              setIncludeImages(true);
              setUseRange(false);
              setTimeout(handleExport, 100);
            }}
            disabled={isExporting}
          >
            <FileText className="h-3 w-3 mr-1" />
            PDF Rápido
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedFormat('json');
              setIncludeImages(false);
              setUseRange(false);
              setTimeout(handleExport, 100);
            }}
            disabled={isExporting}
          >
            <Database className="h-3 w-3 mr-1" />
            Backup JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};