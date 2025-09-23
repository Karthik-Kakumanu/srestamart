import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'lodash', 'react-ga', 'framer-motion', 'lucide-react'],
          homepage: ['./src/pages/HomePage.jsx'],
          cart: ['./src/pages/CartPage.jsx'],
          auth: ['./src/pages/AuthPage.jsx']
        }
      }
    }
  }
});