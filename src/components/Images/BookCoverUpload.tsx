import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, BookOpen, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CoverSelector } from './CoverSelector';

interface BookCoverUploadProps {
  bookId: string;
  onCoverUploaded?: () => void;
}

export const BookCoverUpload = ({ bookId, onCoverUploaded }: BookCoverUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadCover = async () => {
    if (!selectedFile || !user) return;

    console.log('🖼️ BookCoverUpload - Iniciando upload:', { 
      fileName: selectedFile.name, 
      fileSize: selectedFile.size,
      userId: user.id,
      bookId 
    });

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

      console.log('📁 Tentando upload para storage:', { fileName, bucket: 'book-images' });

      // Upload para Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('book-images')
        .upload(fileName, selectedFile);

      console.log('📁 Resultado do storage:', { storageData, storageError });

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

      console.log('💾 Salvando metadados no banco...');

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

      console.log('💾 Resultado do banco - images:', { imageData, dbError });

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

      // Remover capas antigas primeiro
      console.log('🗑️ Removendo capas antigas...');
      await supabase
        .from('book_covers')
        .delete()
        .eq('book_id', bookId)
        .eq('user_id', user.id);

      // Criar nova entrada na tabela book_covers
      console.log('💾 Criando entrada na tabela book_covers...');
      const { data: coverData, error: coverError } = await supabase
        .from('book_covers')
        .insert({
          book_id: bookId,
          image_id: imageData.id,
          user_id: user.id
        })
        .select();

      console.log('💾 Resultado do banco - book_covers:', { coverData, coverError });

      toast({
        title: "Capa carregada!",
        description: "Imagem de capa definida com sucesso"
      });

      // Limpar formulário
      setSelectedFile(null);
      setPreviewUrl(null);
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

        {/* Divisor */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Seletor da galeria */}
        <CoverSelector bookId={bookId} onCoverSelected={onCoverUploaded} />

        {/* Preview profissional do arquivo selecionado */}
        {selectedFile && previewUrl && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Preview da Capa
            </h4>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Preview da imagem */}
                <div className="flex-shrink-0">
                  <div className="aspect-[2/3] w-32 mx-auto md:mx-0 bg-white rounded-lg shadow-lg overflow-hidden border-2 border-slate-200">
                    <img 
                      src={previewUrl} 
                      alt="Preview da capa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Informações da imagem */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-600 dark:text-slate-400">Nome:</span>
                      <p className="text-slate-900 dark:text-slate-100 truncate">{selectedFile.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600 dark:text-slate-400">Tamanho:</span>
                      <p className="text-slate-900 dark:text-slate-100">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600 dark:text-slate-400">Tipo:</span>
                      <p className="text-slate-900 dark:text-slate-100">{selectedFile.type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600 dark:text-slate-400">Formato:</span>
                      <p className="text-slate-900 dark:text-slate-100">Capa de livro</p>
                    </div>
                  </div>
                  
                  {/* Indicadores de qualidade */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedFile.size > 5 * 1024 * 1024 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Qualidade: {selectedFile.size > 5 * 1024 * 1024 ? 'Alta' : 'Média'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Compatível com exportação PDF/EPUB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};