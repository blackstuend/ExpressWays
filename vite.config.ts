import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'ExpressWays',
        short_name: 'ExpressWays',
        description: 'Your ExpressWays Application',
        theme_color: '#1e1e1e',
        icons: [
          {
            src: '/ExpressWays/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/ExpressWays/favicon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/ExpressWays/favicon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/ExpressWays/favicon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  base: '/ExpressWays/',
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
