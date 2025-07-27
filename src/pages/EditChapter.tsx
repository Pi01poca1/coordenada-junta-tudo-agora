import { useState } from "react";
import { useParams } from "react-router-dom";

import { Navigation } from "@/components/Layout/Navigation";
import { ChapterForm } from "@/components/Chapters/ChapterForm";
import ImageRendererInline from "@/components/Images/ImageRendererInline";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const EditChapter = () => {
  const { id, chapterId: cid } = useParams<{ id?: string; chapterId?: string }>();
  const chapterId = (id ?? cid) as string | undefined;

  const [editImages, setEditImages] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ChapterForm />

        <div className="flex items-center gap-2 my-4">
          <Switch id="edit-images" checked={editImages} onCheckedChange={setEditImages} />
          <Label htmlFor="edit-images">Editar imagens (beta)</Label>
        </div>

        {editImages && chapterId ? (
          <ImageRendererInline chapterId={chapterId} />
        ) : editImages && !chapterId ? (
          <p className="text-sm text-muted-foreground">Nenhum <code>chapterId</code> encontrado na rota.</p>
        ) : null}
      </main>
    </div>
  );
};

export default EditChapter;
