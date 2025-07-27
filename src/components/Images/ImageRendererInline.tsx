import { CSSProperties, useState } from "react";
import { useImages } from "@/hooks/useImages";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Props = { chapterId?: string; bookId?: string };

export default function ImageRendererInline({ chapterId, bookId }: Props) {
  const { images, update } = useImages({ chapterId, bookId });
  const [selected, setSelected] = useState<string | null>(null);

  const getContainerClasses = (layout?: string | null, wrap?: string | null) => {
    const base = ["my-4", "relative", "align-top"];
    switch (layout) {
      case "center": base.push("block", "mx-auto", "text-center"); break;
      case "float-left": base.push("float-left", "mr-4", "mb-2"); break;
      case "float-right": base.push("float-right", "ml-4", "mb-2"); break;
      case "full-width": base.push("block", "w-full"); break;
      case "block": base.push("block", "my-6"); break;
      default: base.push("inline-block"); break;
    }
    switch (wrap) {
      case "wrap":
      case "tight": base.push("clear-none"); break;
      case "break":
      case "none":
      default: base.push("clear-both"); break;
    }
    return base.join(" ");
  };

  const getImgStyle = (img: any): CSSProperties => {
    const style: CSSProperties = {
      maxWidth: "100%",
      height: "auto",
      transform: `scale(${img.scale ?? 1})`,
      position: "relative",
      left: img.position_x ? `${img.position_x}px` : undefined,
      top: img.position_y ? `${img.position_y}px` : undefined,
      userSelect: "none",
      display: "block",
      zIndex: img.z_index ?? 0
    };
    if (img.width) style.width = `${img.width}px`;
    if (img.height) style.height = `${img.height}px`;
    return style;
  };

  const onDragStart = (e: React.PointerEvent, img: any) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.((e as any).pointerId);
    (e.currentTarget as any).__start = { x: e.clientX, y: e.clientY, px: img.position_x ?? 0, py: img.position_y ?? 0, id: img.id };
    setSelected(img.id);
  };
  const onDragMove = (e: React.PointerEvent, img: any) => {
    const s = (e.currentTarget as any).__start;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    update(s.id, { position_x: s.px + dx, position_y: s.py + dy });
  };
  const onDragEnd = (e: React.PointerEvent) => {
    (e.currentTarget as any).__start = null;
  };

  if (!images?.length) return null;

  return (
    <div className="image-container">
      {images.map((img) => {
        const isSelected = selected === img.id;
        return (
          <div key={img.id} className={getContainerClasses(img.layout, img.text_wrap)} style={{ position: "relative" }}>
            <img src={img.url} alt={img.alt_text || img.filename} className="rounded-lg shadow-sm" style={getImgStyle(img)} loading="lazy" />
            <div
              className={`absolute inset-0 ${isSelected ? "ring-2 ring-blue-500" : "ring-1 ring-muted"} rounded-lg`}
              style={{ cursor: "grab" }}
              onPointerDown={(e) => onDragStart(e, img)}
              onPointerMove={(e) => onDragMove(e, img)}
              onPointerUp={onDragEnd}
              onClick={() => setSelected(img.id)}
            />
            {isSelected && (
              <div className="absolute -top-12 left-0 flex items-center gap-2 bg-background/80 backdrop-blur px-2 py-1 rounded-md shadow border">
                <div className="w-40">
                  <Slider value={[Number(img.scale ?? 1)]} min={0.25} max={3} step={0.05} onValueChange={(v) => update(img.id, { scale: v[0] })} />
                </div>
                <Select value={img.layout ?? "inline"} onValueChange={(v) => update(img.id, { layout: v })}>
                  <SelectTrigger className="w-36 h-8"><SelectValue placeholder="Layout" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inline">Inline</SelectItem>
                    <SelectItem value="center">Centralizada</SelectItem>
                    <SelectItem value="float-left">Float Left</SelectItem>
                    <SelectItem value="float-right">Float Right</SelectItem>
                    <SelectItem value="block">Bloco</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={img.text_wrap ?? "none"} onValueChange={(v) => update(img.id, { text_wrap: v })}>
                  <SelectTrigger className="w-28 h-8"><SelectValue placeholder="Wrap" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem wrap</SelectItem>
                    <SelectItem value="wrap">Wrap</SelectItem>
                    <SelectItem value="tight">Tight</SelectItem>
                    <SelectItem value="break">Quebrar</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="secondary" onClick={() => update(img.id, { position_x: 0, position_y: 0, scale: 1 })}>Reset</Button>
              </div>
            )}
            {img.alt_text && <p className="text-xs text-muted-foreground text-center mt-2 italic">{img.alt_text}</p>}
          </div>
        );
      })}
    </div>
  );
}
