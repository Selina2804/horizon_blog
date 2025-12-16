import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "tslib": "tslib/tslib.es6.js",
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://693a3c10c8d59937aa0a30c1.mockapi.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
