import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The 'build' section that externalized 'jwt-decode' has been removed.
  // Vite will now correctly bundle the library with your application code.
});