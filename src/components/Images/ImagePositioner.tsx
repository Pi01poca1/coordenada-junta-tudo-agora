import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Move, RotateCcw, Save, X, Maximize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Image {
  id: string;
  filename: string;
  url: string;
  position_x: number | null;
  position_y: number | null;
  scale: number | null;
  z_index: number | null;
  layout: string | null;
  text_wrap: string | null;
}

interface ImagePositionerProps {
  image: Image;
  onClose: () => void;
  onUpdate: () => void;
  chapterContent?: string;
}

export const ImagePositioner = ({ image, onClose, onUpdate, chapterContent }: ImagePositionerProps) => {
  const [position, setPosition] = useState({ x: image.position_x || 0, y: image.position_y || 0 });
  const [scale, setScale] = useState((image.scale || 1) * 100);
  const [zIndex, setZIndex] = useState(image.z_index || 0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(rect.width - 100, e.clientX - rect.left - dragStart.x));
      const newY = Math.max(0, Math.min(rect.height - 100, e.clientY - rect.top - dragStart.y));
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setScale(100);
    setZIndex(0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('images')
        .update({
          position_x: position.x,
          position_y: position.y,
          scale: scale / 100,
          z_index: zIndex,
          layout: 'absolute' // Indicar posicionamento absoluto
        })
        .eq('id', image.id);

      if (error) throw error;

      toast({
        title: "Posição salva!",
        description: "Posicionamento da imagem atualizado"
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar posição:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar posicionamento",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Move className="h-5 w-5" />
            <span>Posicionar Imagem</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Área de preview com texto simulado */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Preview do Posicionamento</Label>
            <Badge variant="outline">
              Arraste a imagem para posicionar
            </Badge>
          </div>
          
          <div 
            ref={containerRef}
            className="relative border rounded-lg p-4 min-h-[400px] bg-gray-50 overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Texto simulado do capítulo */}
            {chapterContent ? (
              <div className="text-sm text-gray-600 leading-relaxed">
                {chapterContent.slice(0, 500)}...
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </div>
            )}
            
            {/* Imagem posicionável */}
            <img
              ref={imageRef}
              src={image.url}
              alt={image.filename}
              className={`absolute border-2 border-blue-500 rounded shadow-lg cursor-move ${isDragging ? 'border-blue-700 shadow-xl' : ''}`}
              style={{
                left: position.x,
                top: position.y,
                transform: `scale(${scale / 100})`,
                transformOrigin: 'top left',
                zIndex: zIndex + 10,
                maxWidth: '200px',
                maxHeight: '200px',
                objectFit: 'contain'
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          </div>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Escala */}
          <div className="space-y-2">
            <Label>Tamanho ({scale}%)</Label>
            <Slider
              value={[scale]}
              onValueChange={(value) => setScale(value[0])}
              max={200}
              min={25}
              step={5}
              className="w-full"
            />
          </div>

          {/* Z-Index */}
          <div className="space-y-2">
            <Label>Camada (Z-Index)</Label>
            <Slider
              value={[zIndex]}
              onValueChange={(value) => setZIndex(value[0])}
              max={10}
              min={-10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Posição manual */}
          <div className="space-y-2">
            <Label>Posição Manual</Label>
            <div className="text-xs text-muted-foreground">
              X: {Math.round(position.x)}px, Y: {Math.round(position.y)}px
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex space-x-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Posição'}
          </Button>
          
          <Button variant="outline" onClick={resetPosition}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>

        {/* Dicas */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>💡 <strong>Dicas:</strong></div>
          <div>• Arraste a imagem para posicioná-la</div>
          <div>• Use o slider para ajustar o tamanho</div>
          <div>• Z-Index controla qual imagem fica na frente</div>
          <div>• Valores negativos de Z-Index colocam a imagem atrás do texto</div>
        </div>
      </CardContent>
    </Card>
  );
};