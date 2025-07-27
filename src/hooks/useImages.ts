import { useEffect, useRef, useState, useCallback } from "react";
import type { ImageEntity } from "@/services/images";
import { listImages, updateImage } from "@/services/images";
import { useAuth } from "@/contexts/AuthContext";

export function useImages(opts: { chapterId?: string; bookId?: string }) {
  const { user } = useAuth();
  const [images, setImages] = useState<ImageEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    if (!user || (!opts.chapterId && !opts.bookId)) return;
    setLoading(true);
    try {
      const data = await listImages({ userId: user.id, chapterId: opts.chapterId, bookId: opts.bookId });
      setImages(data);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [user, opts.chapterId, opts.bookId]);

  useEffect(() => { load(); }, [load]);

  const timer = useRef<number | null>(null);
  const debouncedUpdate = useCallback(async (id: string, patch: Partial<ImageEntity>) => {
    if (!user) return;
    if (timer.current) window.clearTimeout(timer.current);
    setImages(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)));
    timer.current = window.setTimeout(async () => {
      await updateImage(id, patch, user.id);
    }, 500);
  }, [user]);

  return { images, setImages, loading, error, reload: load, update: debouncedUpdate };
}

