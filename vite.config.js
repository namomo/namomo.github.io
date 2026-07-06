import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { version } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
          if (id.includes('react-dom') || /node_modules[\\/]+react[\\/]/.test(id)) return 'react';
          if (id.includes('zustand') || id.includes('lucide-react')) return 'vendor';
          return undefined;
        },
      },
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(version),
  },

})


