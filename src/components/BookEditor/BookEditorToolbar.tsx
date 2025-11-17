import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Type, Ruler, Space } from 'lucide-react'

interface BookEditorToolbarProps {
  fontFamily: string
  fontSize: number
  lineHeight: number
  useABNT: boolean
  onFontFamilyChange: (value: string) => void
  onFontSizeChange: (value: number) => void
  onLineHeightChange: (value: number) => void
  onUseABNTChange: (value: boolean) => void
}

export const BookEditorToolbar = ({
  fontFamily,
  fontSize,
  lineHeight,
  useABNT,
  onFontFamilyChange,
  onFontSizeChange,
  onLineHeightChange,
  onUseABNTChange,
}: BookEditorToolbarProps) => {
  return (
    <div className="h-full bg-background border-r overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Type className="h-5 w-5" />
            Ferramentas
          </h2>
        </div>

        <Separator />

        {/* ABNT Toggle */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Padrão ABNT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="abnt-mode" className="text-sm">
                Usar formatação ABNT
              </Label>
              <Switch
                id="abnt-mode"
                checked={useABNT}
                onCheckedChange={onUseABNTChange}
              />
            </div>
            {useABNT && (
              <p className="text-xs text-muted-foreground mt-2">
                Fonte Times New Roman 12pt, espaçamento 1.5, margens 3cm superior e esquerda, 2cm inferior e direita
              </p>
            )}
          </CardContent>
        </Card>

        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Fonte
          </Label>
          <Select
            value={fontFamily}
            onValueChange={onFontFamilyChange}
            disabled={useABNT}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="serif">Serif (Times)</SelectItem>
              <SelectItem value="sans">Sans-serif (Arial)</SelectItem>
              <SelectItem value="mono">Monospace</SelectItem>
              <SelectItem value="Georgia, serif">Georgia</SelectItem>
              <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
              <SelectItem value="'Palatino Linotype', serif">Palatino</SelectItem>
              <SelectItem value="'Book Antiqua', serif">Book Antiqua</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Tamanho ({fontSize}pt)
          </Label>
          <Slider
            value={[fontSize]}
            onValueChange={([value]) => onFontSizeChange(value)}
            min={10}
            max={24}
            step={1}
            disabled={useABNT}
            className="w-full"
          />
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Space className="h-4 w-4" />
            Entre-linhas ({lineHeight.toFixed(1)})
          </Label>
          <Slider
            value={[lineHeight]}
            onValueChange={([value]) => onLineHeightChange(value)}
            min={1}
            max={3}
            step={0.1}
            disabled={useABNT}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 Dica: Todas as alterações são salvas automaticamente</p>
          <p>✍️ Clique no texto para editar</p>
        </div>
      </div>
    </div>
  )
}
