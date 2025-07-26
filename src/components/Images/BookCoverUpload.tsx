import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, BookOpen, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BookCoverUploadProps {
  bookId: string;
  onCoverUploaded?: () => void;
}

export const BookCoverUpload = ({ bookId, onCoverUploaded }: BookCoverUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadCover = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);

    try {
      // Validar tipo de arquivo
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem válida",
          variant: "destructive"
        });
        return;
      }

      // Validar tamanho (máximo 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 50MB",
          variant: "destructive"
        });
        return;
      }

      // Gerar nome único para o arquivo
      const fileExtension = selectedFile.name.split('.').pop();
      const timestamp = Date.now();
      const uniqueFileName = `cover_${timestamp}.${fileExtension}`;
      const fileName = `${user.id}/${bookId}/${uniqueFileName}`;

      // Upload para Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('book-images')
        .upload(fileName, selectedFile);

      if (storageError) {
        console.error('Erro no upload:', storageError);
        toast({
          title: "Erro no upload",
          description: "Falha ao enviar a imagem de capa",
          variant: "destructive"
        });
        return;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('book-images')
        .getPublicUrl(fileName);

      // Salvar metadados no banco (como imagem do livro)
      const { data: imageData, error: dbError } = await supabase
        .from('images')
        .insert({
          user_id: user.id,
          book_id: bookId,
          chapter_id: null,
          filename: selectedFile.name,
          storage_path: fileName,
          url: urlData.publicUrl,
          alt_text: `Capa do livro`,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          layout: 'cover' // Identificar como capa
        })
        .select()
        .single();

      if (dbError) {
        console.error('Erro ao salvar metadados:', dbError);
        // Limpar arquivo do storage se falhou salvar no banco
        await supabase.storage.from('book-images').remove([fileName]);
        toast({
          title: "Erro",
          description: "Falha ao salvar informações da capa",
          variant: "destructive"
        });
        return;
      }

      // Criar entrada na tabela book_covers
      await supabase
        .from('book_covers')
        .upsert({
          book_id: bookId,
          image_id: imageData.id,
          user_id: user.id
        });

      toast({
        title: "Capa carregada!",
        description: "Imagem de capa definida com sucesso"
      });

      // Limpar formulário
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onCoverUploaded) {
        onCoverUploaded();
      }

    } catch (error) {
      console.error('Erro geral no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Falha geral no processo de upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Capa do Livro</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cover-file">Selecionar Imagem de Capa</Label>
          <Input
            id="cover-file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
          />
          <p className="text-xs text-muted-foreground">
            Recomendado: 1600x2400px (proporção 2:3). Máximo 50MB.
          </p>
        </div>

        <Button 
          onClick={uploadCover} 
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          <Star className="h-4 w-4 mr-2" />
          {uploading ? 'Definindo Capa...' : 'Definir como Capa'}
        </Button>

        {/* Preview do arquivo selecionado */}
        {selectedFile && (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivo selecionado:</h4>
            <div className="text-sm text-muted-foreground">
              <p>{selectedFile.name}</p>
              <p>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};