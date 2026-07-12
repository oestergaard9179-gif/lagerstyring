import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Gør stien relativ, så det virker fejlfrit både lokalt og på GitHub Pages
  plugins: [
    react(),
    tailwindcss(),
  ],
})