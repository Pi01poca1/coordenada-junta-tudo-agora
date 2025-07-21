import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/supabaseStorage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  chapterId: string;
  onUploadComplete: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ chapterId, onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload images",
        variant: "destructive",
      });
      return;
    }

    // Validate file
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPEG and PNG images are allowed",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "Error",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Get image dimensions
      const { width, height } = await getImageDimensions(file);

      // Upload to storage
      const { path, publicUrl } = await uploadImage(chapterId, file);

      // Save to database
      const { error: dbError } = await supabase
        .from('images')
        .insert({
          chapter_id: chapterId,
          storage_path: publicUrl,
          width,
          height,
          layout: 'inline',
          alt_text: file.name
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (dbError) {
        if (dbError.message.includes('row-level security') || dbError.message.includes('policy')) {
          toast({
            title: "Not allowed",
            description: "You don't have permission to upload images to this chapter",
            variant: "destructive",
          });
        } else {
          throw dbError;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Uploaded!",
      });

      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [chapterId]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="text-lg font-medium mb-2">
            {dragActive ? 'Drop image here' : 'Upload Image'}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Drag and drop or click to select • JPEG, PNG • Max 5MB
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInput}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label htmlFor="image-upload">
            <Button variant="outline" disabled={uploading} asChild>
              <span>Choose File</span>
            </Button>
          </label>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </div>
  );
};