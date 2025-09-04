import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/global-expansion/',
  define: {
    __DEFINES__: JSON.stringify({}),
    global: 'globalThis',
    'process.env': '{}',
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    define: {
      __DEFINES__: '{}',
    },
  },
  optimizeDeps: {
    include: ['mapbox-gl'],
  },
})
