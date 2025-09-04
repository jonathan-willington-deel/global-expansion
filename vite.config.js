import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/global-expansion/',
  define: {
    __DEFINES__: JSON.stringify({}),
    __BASE__: JSON.stringify('/global-expansion/'),
    __HMR_BASE__: JSON.stringify('/global-expansion/'),
    __HMR_DIRECT_TARGET__: JSON.stringify(''),
    __HMR_ENABLE_OVERLAY__: true,
    __HMR_HOSTNAME__: JSON.stringify('localhost'),
    __HMR_PORT__: 24678,
    __HMR_PROTOCOL__: JSON.stringify('ws'),
    __HMR_TIMEOUT__: 30000,
    __SERVER_HOST__: JSON.stringify('localhost'),
    __WS_TOKEN__: JSON.stringify(''),
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
