import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { version } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/side-react-unit-bridge/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },

})


