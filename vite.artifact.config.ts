import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Однофайловая сборка для публикации как страницы (артефакта):
// весь JS/CSS и шрифты инлайнятся в один index.html без внешних запросов
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  base: './',
  build: {
    outDir: 'dist-artifact',
    chunkSizeWarningLimit: 100000,
  },
});
