import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  optimizeDeps: {
    include: ['lucide-react'],
    esbuildOptions: {
      // Enable esbuild's tree shaking for production
      treeShaking: true,
    },
  },
  build: {
    rollupOptions: {
      // Ensure proper handling of dynamic imports
      output: {
        manualChunks: {
          'lucide-react': ['lucide-react']
        }
      }
    }
  }
});
