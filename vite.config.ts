import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Uncomment para analisar bundle size: npm run build && open dist/stats.html
    // visualizer({
    //   filename: 'dist/stats.html',
    //   open: false,
    //   gzipSize: true,
    //   brotliSize: true,
    // }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          
          // Supabase
          if (id.includes('node_modules/@supabase/') || id.includes('supabase')) {
            return 'supabase';
          }
          
          // Radix UI (shadcn/ui components)
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-ui';
          }
          
          // Lucide Icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          
          // Form libraries
          if (id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/@hookform/') ||
              id.includes('node_modules/zod')) {
            return 'forms';
          }
          
          // Rich text editor
          if (id.includes('node_modules/react-quill') || id.includes('quill')) {
            return 'editor';
          }
          
          // Charts
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'charts';
          }
          
          // Drag and drop
          if (id.includes('node_modules/@dnd-kit/')) {
            return 'dnd';
          }
          
          // Outras bibliotecas grandes
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query';
          }
          
          // Other vendor libraries
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 500, // Reduzido para 500KB
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
