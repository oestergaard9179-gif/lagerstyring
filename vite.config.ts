import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/lagerstyring/', // Sætter base path til GitHub Pages repository-navnet for korrekt deploy
  plugins: [
    react(),
    tailwindcss(),
  ],
})