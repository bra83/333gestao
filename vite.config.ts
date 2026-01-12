
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin simples para copiar arquivos essenciais da raiz para dist
const copyPwaFiles = () => {
  return {
    name: 'copy-pwa-files',
    closeBundle: async () => {
      const files = ['sw.js', 'manifest.json'];
      files.forEach(file => {
        const src = path.resolve(__dirname, file);
        const dest = path.resolve(__dirname, 'dist', file);
        if (fs.existsSync(src)) {
          if (!fs.existsSync(path.dirname(dest))) {
             fs.mkdirSync(path.dirname(dest), { recursive: true });
          }
          fs.copyFileSync(src, dest);
          console.log(`[PWA] Copied ${file} to dist`);
        }
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), copyPwaFiles()],
  base: './', // CRÍTICO: Garante que funcione em subpastas (ex: usuario.github.io/repo)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  publicDir: false // Mantemos false pois estamos copiando manualmente
})
