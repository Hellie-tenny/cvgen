import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import Sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    Sitemap({ 
          hostname: 'https://ettiquette-cv.web.app',
          // dynamicRoutes: ['/about', '/templates'] // Add your routes here
        })
  ],
  resolve: {
    alias: [
      { find: '@/lib', replacement: path.resolve(__dirname, './lib') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  }
})
