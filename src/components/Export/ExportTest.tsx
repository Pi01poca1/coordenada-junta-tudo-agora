import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExport } from '@/hooks/useExport';
import { Download } from 'lucide-react';

interface ExportTestProps {
  bookId: string;
}

export const ExportTest = ({ bookId }: ExportTestProps) => {
  const { exportBook, isExporting } = useExport();

  const testFormats = ['pdf', 'docx', 'html', 'json'] as const;

  const handleTestExport = async (format: typeof testFormats[number]) => {
    console.log(`🧪 Testing ${format} export for book ${bookId}`);
    const result = await exportBook(bookId, format, { includeImages: true });
    console.log(`📄 Test result for ${format}:`, result ? 'SUCCESS' : 'FAILED');
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-sm">Teste de Exportação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {testFormats.map((format) => (
            <Button
              key={format}
              variant="outline"
              size="sm"
              onClick={() => handleTestExport(format)}
              disabled={isExporting}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              {format.toUpperCase()}
            </Button>
          ))}
        </div>
        {isExporting && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Testando exportação...
          </div>
        )}
      </CardContent>
    </Card>
  );
};