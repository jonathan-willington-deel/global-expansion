import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/global-expansion/',
  define: {
    __DEFINES__: '{}',
    __BASE__: '"/global-expansion/"',
    __HMR_BASE__: '"/global-expansion/"',
    __HMR_DIRECT_TARGET__: '""',
    __HMR_ENABLE_OVERLAY__: 'true',
    __HMR_HOSTNAME__: '"localhost"',
    __HMR_PORT__: '24678',
    __HMR_PROTOCOL__: '"ws"',
    __HMR_TIMEOUT__: '30000',
    __SERVER_HOST__: '"localhost"',
    __WS_TOKEN__: '""',
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
