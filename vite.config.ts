
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        }
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), copyPwaFiles()],
  base: '/3dforge/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  publicDir: false
})
