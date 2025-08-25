import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          // Force React to be in a single chunk
          'react-vendor': ['react', 'react-dom'],
          // Keep other libraries separate
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'router': ['react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    sourcemap: false,
    minify: 'esbuild', // Usar esbuild ao invés de terser
  },
  esbuild: {
    drop: mode === 'production' ? ['debugger'] : [],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [],
  },
}));
