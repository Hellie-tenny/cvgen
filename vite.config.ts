import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: [
      { find: '@/lib', replacement: path.resolve(__dirname, './lib') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  }
})
