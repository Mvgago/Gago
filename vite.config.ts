import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    outDir: 'dist'
  },
  // The 3D stage loads lazily; pre-bundle its libraries up front so the dev server
  // does not have to re-optimise (and reload) the first time /projects is opened
  optimizeDeps: {
    include: ['@react-three/fiber', 'three'],
  },
})

