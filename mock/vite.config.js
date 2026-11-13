import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        site: resolve(import.meta.dirname, 'index.html'),
        app: resolve(import.meta.dirname, 'app.html'),
        console: resolve(import.meta.dirname, 'console.html'),
        scan: resolve(import.meta.dirname, 'scan.html'),
        login: resolve(import.meta.dirname, 'login.html'),
        adminLogin: resolve(import.meta.dirname, 'admin-login.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
