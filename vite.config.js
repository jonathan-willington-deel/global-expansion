import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/global-expansion/',
  define: {
    __DEFINES__: JSON.stringify({}),
    __HMR_CONFIG_NAME__: JSON.stringify('vite'),
    __HMR_PORT__: JSON.stringify(24678),
    __HMR_HOSTNAME__: JSON.stringify('localhost'),
    __BASE__: JSON.stringify('/global-expansion/'),
    __DEV__: JSON.stringify(false),
    __PROD__: JSON.stringify(true),
    global: 'globalThis',
    'process.env': '{}',
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  optimizeDeps: {
    include: ['mapbox-gl'],
  },
})
