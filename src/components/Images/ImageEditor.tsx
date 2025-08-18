import { useState, useEffect } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { Move, Maximize2, Type, X } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Image {
  id: string
  filename: string
  url: string
  position_x: number | null
  position_y: number | null
  scale: number | null
  text_wrap: string | null
  layout: string | null
  z_index: number | null
  width: number | null
  height: number | null
}

interface ImageEditorProps {
  image: Image
  onClose: () => void
  onUpdate: () => void
}

export const ImageEditor = ({ image, onClose, onUpdate }: ImageEditorProps) => {
  const [positionX, setPositionX] = useState(image.position_x || 0)
  const [positionY, setPositionY] = useState(image.position_y || 0)
  const [scale, setScale] = useState((image.scale || 1) * 100)
  const [textWrap, setTextWrap] = useState(image.text_wrap || 'none')
  const [layout, setLayout] = useState(image.layout || 'inline')
  const [zIndex, setZIndex] = useState(image.z_index || 0)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
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
        .eq('id', image.id)

      if (error) throw error

      toast({
        title: 'Configurações salvas!',
        description: 'Propriedades da imagem atualizadas com sucesso',
      })

      onUpdate()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao salvar configurações da imagem',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Maximize2 className="h-5 w-5" />
            <span>Editar Imagem</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview da imagem */}
        <div className="relative overflow-hidden rounded-lg border">
          <img
            src={image.url}
            alt={image.filename}
            className="h-32 w-full object-cover"
            style={{
              transform: `scale(${scale / 100})`,
              transformOrigin: 'center',
            }}
          />
        </div>

        {/* Layout */}
        <div className="space-y-2">
          <Label>Tipo de Layout</Label>
          <Select value={layout} onValueChange={setLayout}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inline">Inline (no texto)</SelectItem>
              <SelectItem value="block">Block (linha própria)</SelectItem>
              <SelectItem value="float-left">Float Left (lado esquerdo)</SelectItem>
              <SelectItem value="float-right">Float Right (lado direito)</SelectItem>
              <SelectItem value="center">Centralizada</SelectItem>
              <SelectItem value="full-width">Largura total</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Wrap */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-1">
            <Type className="h-4 w-4" />
            <span>Comportamento do Texto</span>
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

        {/* Position para layouts avançados */}
        {(layout === 'float-left' || layout === 'float-right') && (
          <>
            <div className="space-y-2">
              <Label className="flex items-center space-x-1">
                <Move className="h-4 w-4" />
                <span>Posição Horizontal (px)</span>
              </Label>
              <Input
                type="number"
                value={positionX}
                onChange={(e) => setPositionX(Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Posição Vertical (px)</Label>
              <Input
                type="number"
                value={positionY}
                onChange={(e) => setPositionY(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </>
        )}

        {/* Z-Index */}
        <div className="space-y-2">
          <Label>Camada (Z-Index)</Label>
          <Input
            type="number"
            value={zIndex}
            onChange={(e) => setZIndex(Number(e.target.value))}
            placeholder="0"
          />
        </div>

        {/* Botões */}
        <div className="flex space-x-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
