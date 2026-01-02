import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),

    /**
     * ================================
     * ✅ SITEMAP – PRODUCTION FIX
     * ================================
     * ⚠️ 強制指定正式網域
     * ⚠️ 完全避免 vercel.app / localhost
     */
    sitemap({
      hostname: 'https://www.nexverisai.com',
      outDir: 'dist',
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],

  /**
   * ================================
   * DEV SERVER
   * ================================
   */
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    host: 'localhost',
  },

  /**
   * ================================
   * BUILD CONFIG
   * ================================
   */
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion', 'sonner'],
          'data-vendor': ['recharts', 'zustand', '@reduxjs/toolkit'],
        }
      }
    }
  }
})
