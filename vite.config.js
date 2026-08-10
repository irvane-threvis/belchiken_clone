import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // GitHub Pages sert depuis /belchiken_clone/ — sans ce base,
  // tous les assets JS/CSS ne se chargent pas et l'écran est blanc.
  base: '/belchiken_clone/',
})
