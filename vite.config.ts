import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  // Define que arquivos na raiz (como sw.js e manifest.json) devem ser copiados
  publicDir: false, 
  // Alternativa manual: o build do Vite por padrão inclui o que está no index.html.
  // Como sw.js e manifest são referenciados no HTML, eles serão processados.
})