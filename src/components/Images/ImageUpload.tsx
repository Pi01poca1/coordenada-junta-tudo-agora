import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

interface ImageUploadProps {
  bookId?: string
  chapterId?: string
  onImageUploaded?: (imageUrl: string, imageId: string) => void
}

interface UploadedImage {
  id: string
  url: string
  alt_text: string
  filename: string
}

export const ImageUpload = ({ bookId, chapterId, onImageUploaded }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [altText, setAltText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setSelectedFiles(files)
    }
  }

  const uploadImages = async () => {
    if (!selectedFiles || !user) {
      console.log('❌ Upload stopped: no files or no user', {
        selectedFiles: !!selectedFiles,
        user: !!user,
      })
      return
    }

    console.log('🚀 Starting upload process...', {
      fileCount: selectedFiles.length,
      bookId,
      chapterId,
      userId: user.id,
    })

    setUploading(true)
    const newImages: UploadedImage[] = []

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Arquivo inválido',
            description: `${file.name} não é uma imagem válida`,
            variant: 'destructive',
          })
          continue
        }

        // Validar tamanho (máximo 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: 'Arquivo muito grande',
            description: `${file.name} excede o limite de 50MB`,
            variant: 'destructive',
          })
          continue
        }

        // Gerar nome único para o arquivo
        const fileExtension = file.name.split('.').pop()
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2)
        const uniqueFileName = `${timestamp}_${randomString}.${fileExtension}`
        const fileName = `${user.id}/${chapterId || bookId}/${uniqueFileName}`

        // Determinar bucket baseado no tipo
        const bucketName = chapterId ? 'chapter-images' : 'book-images'

        console.log('📁 Tentando upload para storage:', { fileName, bucket: bucketName })

        // Upload para Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file)

        console.log('📁 Resultado do storage:', { storageData, storageError })

        if (storageError) {
          console.error('Erro no upload:', storageError)
          toast({
            title: 'Erro no upload',
            description: `Falha ao enviar ${file.name}`,
            variant: 'destructive',
          })
          continue
        }

        // Obter URL pública
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName)

        // Salvar metadados no banco
        const { data: imageData, error: dbError } = await supabase
          .from('images')
          .insert({
            user_id: user.id,
            book_id: bookId || null,
            chapter_id: chapterId || null,
            filename: file.name,
            storage_path: fileName,
            url: urlData.publicUrl,
            alt_text: altText || file.name,
            file_size: file.size,
            mime_type: file.type,
          })
          .select()
          .single()

        if (dbError) {
          console.error('Erro ao salvar metadados:', dbError)
          // Limpar arquivo do storage se falhou salvar no banco
          await supabase.storage.from(bucketName).remove([fileName])
          continue
        }

        const uploadedImage: UploadedImage = {
          id: imageData.id,
          url: urlData.publicUrl,
          alt_text: imageData.alt_text,
          filename: file.name,
        }

        newImages.push(uploadedImage)

        // Callback para notificar upload
        if (onImageUploaded) {
          onImageUploaded(urlData.publicUrl, imageData.id)
        }

        console.log(
          '✅ ImageUpload: Uploaded successfully:',
          imageData.filename,
          'BookId:',
          bookId,
          'ChapterId:',
          chapterId
        )
      }

      setUploadedImages((prev) => [...prev, ...newImages])

      if (newImages.length > 0) {
        toast({
          title: 'Upload concluído!',
          description: `${newImages.length} imagem(ns) enviada(s) com sucesso`,
        })
      }

      // Limpar formulário
      setSelectedFiles(null)
      setAltText('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Erro geral no upload:', error)
      toast({
        title: 'Erro no upload',
        description: 'Falha geral no processo de upload',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (imageId: string, storagePath: string) => {
    try {
      // Determinar bucket baseado no tipo (reutilizar lógica)
      const bucketName = chapterId ? 'chapter-images' : 'book-images'

      // Remover do storage
      await supabase.storage.from(bucketName).remove([storagePath])

      // Remover do banco
      await supabase.from('images').delete().eq('id', imageId)

      // Remover da lista local
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId))

      toast({
        title: 'Imagem removida',
        description: 'Imagem deletada com sucesso',
      })
    } catch (error) {
      console.error('Erro ao remover imagem:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao remover imagem',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>Upload de Imagens</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-files">Selecionar Imagens</Label>
          <Input
            id="image-files"
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-1 file:text-sm file:text-primary-foreground hover:file:bg-primary/80"
          />
          <p className="text-xs text-muted-foreground">
            Aceita JPG, PNG, GIF, WebP. Máximo 50MB por arquivo.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alt-text">Texto Alternativo</Label>
          <Input
            id="alt-text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Descrição da imagem para acessibilidade"
          />
        </div>

        <Button onClick={uploadImages} disabled={!selectedFiles || uploading} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Enviando...' : 'Enviar Imagens'}
        </Button>

        {/* Preview de imagens selecionadas */}
        {selectedFiles && (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivos selecionados:</h4>
            <ul className="text-sm text-muted-foreground">
              {Array.from(selectedFiles).map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{file.name}</span>
                  <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Imagens enviadas */}
        {uploadedImages.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Imagens enviadas:</h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {uploadedImages.map((image) => (
                <div key={image.id} className="group relative">
                  <img
                    src={image.url}
                    alt={image.alt_text}
                    className="h-24 w-full rounded-md border object-cover"
                  />
                  <button
                    onClick={() => removeImage(image.id, image.filename)}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{image.filename}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
