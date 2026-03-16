import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    react({
      // Add explicit configuration for React plugin
      include: "**/*.{jsx,tsx}",
      babel: {
        plugins: []
      }
    }),
    tailwindcss(),
    nodePolyfills({
      // simple-peer needs crypto, events, util polyfills
      include: ['buffer', 'process', 'events', 'util', 'stream']
    }),
    mkcert()
  ],
  server: {
    host: true, // Expose to local network
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  },
  define: {
    global: 'window'
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
