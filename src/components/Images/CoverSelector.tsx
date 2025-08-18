import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { ImageIcon, Star, Check } from 'lucide-react'

interface Image {
  id: string
  filename: string
  url: string
  alt_text: string | null
  file_size: number | null
  mime_type: string | null
}

interface CoverSelectorProps {
  bookId: string
  onCoverSelected?: () => void
}

export const CoverSelector = ({ bookId, onCoverSelected }: CoverSelectorProps) => {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [currentCover, setCurrentCover] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchImages()
      fetchCurrentCover()
    }
  }, [open, user, bookId])

  const fetchImages = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('images')
        .select('id, filename, url, alt_text, file_size, mime_type')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Erro ao buscar imagens:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar imagens',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentCover = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('book_covers')
        .select('image_id')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setCurrentCover(data.image_id)
      }
    } catch (error) {
      // Não há capa definida ainda
      setCurrentCover(null)
    }
  }

  const selectAsCover = async (imageId: string) => {
    if (!user) return

    setSelecting(true)
    try {
      // Remover capa atual se existir
      await supabase.from('book_covers').delete().eq('book_id', bookId).eq('user_id', user.id)

      // Definir nova capa
      const { error } = await supabase.from('book_covers').insert({
        book_id: bookId,
        image_id: imageId,
        user_id: user.id,
      })

      if (error) throw error

      setCurrentCover(imageId)
      toast({
        title: 'Capa definida!',
        description: 'Imagem selecionada como capa do livro',
      })

      if (onCoverSelected) {
        onCoverSelected()
      }

      setOpen(false)
    } catch (error) {
      console.error('Erro ao definir capa:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao definir capa',
        variant: 'destructive',
      })
    } finally {
      setSelecting(false)
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <ImageIcon className="mr-2 h-4 w-4" />
          Escolher da Galeria
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar Capa do Livro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="py-8 text-center">
              <div className="text-muted-foreground">Carregando imagens...</div>
            </div>
          ) : images.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-muted-foreground">
                Nenhuma imagem encontrada. Faça upload de imagens primeiro.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
                <Card
                  key={image.id}
                  className="group relative cursor-pointer transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-2">
                    <div className="relative mb-2 aspect-[3/4]">
                      <img
                        src={image.url}
                        alt={image.alt_text || image.filename}
                        className="h-full w-full rounded object-cover"
                      />

                      {/* Badge da capa atual */}
                      {currentCover === image.id && (
                        <Badge className="absolute right-1 top-1 bg-green-500">
                          <Check className="mr-1 h-3 w-3" />
                          Capa
                        </Badge>
                      )}

                      {/* Overlay com botão */}
                      <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="sm"
                          onClick={() => selectAsCover(image.id)}
                          disabled={selecting || currentCover === image.id}
                          className="bg-white text-black hover:bg-gray-100"
                        >
                          {currentCover === image.id ? (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Capa Atual
                            </>
                          ) : (
                            <>
                              <Star className="mr-1 h-3 w-3" />
                              Usar como Capa
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="truncate text-xs font-medium" title={image.filename}>
                        {image.filename}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(image.file_size)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
