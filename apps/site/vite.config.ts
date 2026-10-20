import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: {
      '@isstas/ui': r('../../packages/ui/src/index.ts'),
      '@isstas/i18n': r('../../packages/i18n/src/index.ts'),
      '@admin': r('../admin/src'),
      '@': r('./src'),
    },
  },
  // une seule copie de React meme si l'admin vit dans un autre dossier du monorepo
  server: { port: 3000 },
  build: { target: 'es2022' },
});