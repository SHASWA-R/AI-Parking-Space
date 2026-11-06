import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            const serverRes = res as any;
            if (serverRes && !serverRes.headersSent && typeof serverRes.writeHead === 'function') {
              serverRes.writeHead(503, { 'Content-Type': 'application/json' });
              serverRes.end(JSON.stringify({ error: 'Backend offline', fallback: true }));
            }
          });
        },
      }
    }
  }
})

