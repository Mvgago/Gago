import { defineConfig } from 'vite'

// Configuración para Vite
export default defineConfig({
  base: '/', // Esto es correcto para desplegar en la raíz del dominio
  build: {
    outDir: 'dist',
  },
});