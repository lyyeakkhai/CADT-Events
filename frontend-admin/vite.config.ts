import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * base:
 * - Local dev / standalone: `/` (default)
 * - Unified production deploy: set ADMIN_BASE_PATH=/admin/ in scripts/build-web.sh
 */
export default defineConfig(() => {
  const base = (process.env.ADMIN_BASE_PATH || '/').replace(/\/?$/, '/');

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      port: 3000,
    },
  };
});
