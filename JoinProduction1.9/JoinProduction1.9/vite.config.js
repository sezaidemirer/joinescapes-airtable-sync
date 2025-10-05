import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - sadece analiz için
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    }),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$ /, /\.(gz)$/],
    }),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$ /, /\.(gz)$/],
    })
  ],
  base: '/',
  
  // Build optimizasyonları
  build: {
    // Chunk boyutu uyarısı
    chunkSizeWarningLimit: 1000,
    
    // Module type'ı kaldır - MIME type sorunu için
    target: 'es2015',
    
    // Code splitting optimizasyonu
    rollupOptions: {
      output: {
        // Vendor chunk'ları ayır
        manualChunks: {
          // React ve React Router
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI kütüphaneleri
          'ui-vendor': ['lucide-react'],
          // Supabase
          'supabase': ['@supabase/supabase-js'],
          // Utility kütüphaneleri
          'utils': ['dompurify', 'react-helmet-async']
        },
        
        // Asset dosya adları
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`
          }
          
          return `assets/[name]-[hash].${ext}`
        },
        
        // Chunk dosya adları
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    
    // Minify optimizasyonları
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // console.log'ları tut - debug için
        drop_debugger: true,
        pure_funcs: []
      }
    }
  },
  
  // Development optimizasyonları
  server: {
    // Hot reload optimizasyonu
    hmr: {
      overlay: false
    }
  },
  
  // CSS optimizasyonları
  css: {
    // CSS code splitting
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // Dependency optimizasyonu
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'dompurify',
      'react-helmet-async'
    ]
  }
})
