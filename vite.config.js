import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/global-expansion/',
  define: {
    __DEFINES__: '{}',
    __BASE__: '"/global-expansion/"',
    __HMR_CONFIG_NAME__: '"vite"',
    __HMR_PORT__: '24678',
    __HMR_HOSTNAME__: '"localhost"',
    __SERVER_HOST__: '"localhost"',
    __SERVER_PORT__: '5173',
    __DEV__: 'false',
    __PROD__: 'true',
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
