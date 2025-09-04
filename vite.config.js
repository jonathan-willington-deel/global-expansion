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
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    include: ['mapbox-gl'],
  },
})
