import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Крупные вендорные библиотеки — в отдельные чанки,
        // чтобы ни один чанк не превышал 500 KB
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['motion/react'],
        },
      },
    },
  },
});
