import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // You can specify the port here
    // If you want to automatically open the browser
    open: true,
    // If you have a proxy setup
  },
});