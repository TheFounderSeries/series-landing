import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
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
