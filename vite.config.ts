
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pwaPlugin = () => {
  return {
    name: 'pwa-file-copy',
    closeBundle: async () => {
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      // 1. Cria .nojekyll para o GitHub Pages processar arquivos com underline (_)
      fs.writeFileSync(path.resolve(distDir, '.nojekyll'), '');

      // 2. Copia arquivos do PWA
      const files = ['sw.js', 'manifest.json', 'logo.jpg']; 
      
      files.forEach(file => {
        const src = path.resolve(__dirname, file);
        const dest = path.resolve(distDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`[PWA] Copied ${file} to dist`);
        } else {
          // Não falha o build, apenas avisa, exceto para manifest que é crítico
          if (file === 'manifest.json') console.warn(`[PWA] Aviso: ${file} não encontrado na raiz.`);
        }
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), pwaPlugin()],
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts']
        }
      }
    }
  }
})
