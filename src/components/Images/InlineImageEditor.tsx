import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Settings, Type, RotateCcw, X, Save, Move, Maximize2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Image {
  id: string
  url: string
  filename: string
  position_x: number | null
  position_y: number | null
  scale: number | null
  text_wrap: string | null
  layout: string | null
  z_index: number | null
  alt_text?: string | null
}

interface InlineImageEditorProps {
  images: Image[]
  selectedImageId: string | null
  onSelectImage: (imageId: string | null) => void
  onUpdate: () => void
  editMode: boolean
  chapterContent: string
}

export const InlineImageEditor = ({
  images,
  selectedImageId,
  onSelectImage,
  onUpdate,
  editMode,
  chapterContent,
}: InlineImageEditorProps) => {
  const [draggedImage, setDraggedImage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const selectedImage = images.find((img) => img.id === selectedImageId)

  // Configurações da imagem selecionada
  const [positionX, setPositionX] = useState(selectedImage?.position_x || 0)
  const [positionY, setPositionY] = useState(selectedImage?.position_y || 0)
  const [scale, setScale] = useState((selectedImage?.scale || 1) * 100)
  const [textWrap, setTextWrap] = useState(selectedImage?.text_wrap || 'none')
  const [layout, setLayout] = useState(selectedImage?.layout || 'inline')
  const [zIndex, setZIndex] = useState(selectedImage?.z_index || 0)

  // Atualizar estados quando a imagem selecionada muda
  React.useEffect(() => {
    if (selectedImage) {
      setPositionX(selectedImage.position_x || 0)
      setPositionY(selectedImage.position_y || 0)
      setScale((selectedImage.scale || 1) * 100)
      setTextWrap(selectedImage.text_wrap || 'none')
      setLayout(selectedImage.layout || 'inline')
      setZIndex(selectedImage.z_index || 0)
    }
  }, [selectedImage])

  const handleDragStart = (e: React.DragEvent, imageId: string) => {
    e.dataTransfer.setData('imageId', imageId)
    setDraggedImage(imageId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!containerRef.current || !draggedImage) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Atualizar posição da imagem
      updateImagePosition(draggedImage, x, y)
      setDraggedImage(null)
    },
    [draggedImage]
  )

  const updateImagePosition = async (imageId: string, x: number, y: number) => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('images')
        .update({
          position_x: x,
          position_y: y,
        })
        .eq('id', imageId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Erro ao atualizar posição:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar posição da imagem',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!selectedImage) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('images')
        .update({
          position_x: positionX,
          position_y: positionY,
          scale: scale / 100,
          text_wrap: textWrap,
          layout: layout,
          z_index: zIndex,
        })
        .eq('id', selectedImage.id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Configurações da imagem atualizadas',
      })

      onUpdate()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao salvar configurações',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const resetImageProperties = async () => {
    if (!selectedImage) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('images')
        .update({
          position_x: 0,
          position_y: 0,
          scale: 1,
          text_wrap: 'none',
          layout: 'inline',
          z_index: 0,
        })
        .eq('id', selectedImage.id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Propriedades da imagem resetadas',
      })

      onUpdate()
    } catch (error) {
      console.error('Erro ao resetar:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao resetar propriedades',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const getImageStyle = (image: Image) => {
    const baseStyle: React.CSSProperties = {
      position:
        image.layout === 'float-left' || image.layout === 'float-right' ? 'absolute' : 'relative',
      transform: `scale(${image.scale || 1})`,
      zIndex: image.z_index || 0,
      cursor: editMode ? 'move' : 'default',
      border: selectedImageId === image.id ? '2px solid #3b82f6' : 'none',
      borderRadius: '4px',
      maxWidth: '100%',
      height: 'auto',
    }

    if (image.position_x !== null && image.position_y !== null) {
      baseStyle.left = image.position_x
      baseStyle.top = image.position_y
    }

    // Layout específico
    switch (image.layout) {
      case 'float-left':
        baseStyle.float = 'left'
        baseStyle.marginRight = '16px'
        break
      case 'float-right':
        baseStyle.float = 'right'
        baseStyle.marginLeft = '16px'
        break
      case 'center':
        baseStyle.display = 'block'
        baseStyle.marginLeft = 'auto'
        baseStyle.marginRight = 'auto'
        break
      case 'full-width':
        baseStyle.width = '100%'
        break
    }

    return baseStyle
  }

  return (
    <div className="space-y-6">
      {/* Área de Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview do Capítulo
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => onSelectImage(null)}>
              {editMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {editMode ? 'Sair do Modo Edição' : 'Modo Edição'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="relative min-h-[400px] overflow-auto rounded-lg border bg-background p-4"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Conteúdo do capítulo */}
            <div className="prose max-w-none">
              {chapterContent ? (
                chapterContent.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph || '\u00A0'}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">
                  Escreva o conteúdo do capítulo na aba "Editar Texto" para visualizar o layout com
                  imagens.
                </p>
              )}
            </div>

            {/* Imagens */}
            {images.map((image) => (
              <div
                key={image.id}
                className={`inline-block ${editMode ? 'transition-shadow hover:shadow-lg' : ''}`}
                style={getImageStyle(image)}
              >
                <img
                  src={image.url}
                  alt={image.alt_text || image.filename}
                  draggable={editMode}
                  onDragStart={(e) => handleDragStart(e, image.id)}
                  onClick={() => editMode && onSelectImage(image.id)}
                  className="h-auto max-w-full"
                />
                {editMode && (
                  <div className="absolute right-0 top-0 rounded-bl bg-primary px-2 py-1 text-xs text-primary-foreground">
                    {image.filename}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Painel de Configurações */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações da Imagem
              <Badge variant="outline">{selectedImage.filename}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Layout */}
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inline">Inline (no texto)</SelectItem>
                  <SelectItem value="block">Block (linha própria)</SelectItem>
                  <SelectItem value="float-left">Float Left</SelectItem>
                  <SelectItem value="float-right">Float Right</SelectItem>
                  <SelectItem value="center">Centralizada</SelectItem>
                  <SelectItem value="full-width">Largura total</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text Wrap */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Comportamento do Texto
              </Label>
              <Select value={textWrap} onValueChange={setTextWrap}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não contornar</SelectItem>
                  <SelectItem value="wrap">Contornar imagem</SelectItem>
                  <SelectItem value="break">Quebrar texto</SelectItem>
                  <SelectItem value="tight">Contorno apertado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scale */}
            <div className="space-y-2">
              <Label>Tamanho ({scale}%)</Label>
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                max={200}
                min={10}
                step={5}
                className="w-full"
              />
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  Posição X (px)
                </Label>
                <Input
                  type="number"
                  value={positionX}
                  onChange={(e) => setPositionX(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Posição Y (px)</Label>
                <Input
                  type="number"
                  value={positionY}
                  onChange={(e) => setPositionY(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Z-Index */}
            <div className="space-y-2">
              <Label>Camada (Z-Index)</Label>
              <Input
                type="number"
                value={zIndex}
                onChange={(e) => setZIndex(Number(e.target.value))}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <Button onClick={handleSaveSettings} disabled={saving} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                onClick={resetImageProperties}
                variant="outline"
                disabled={saving}
                className="flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Resetar
              </Button>
              <Button onClick={() => onSelectImage(null)} variant="ghost">
                <X className="mr-2 h-4 w-4" />
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
