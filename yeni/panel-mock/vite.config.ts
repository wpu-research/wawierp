import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Üç ayrı tek dosyalık çıktı: index.html (açık ana sayfa), panel.html (şifreli panel), wall.html (şifresiz duvar ekranı, /tv).
// Ayrı derlenir ki ana sayfa paketi panel verisini hiç içermesin.
const page = process.env.PAGE === 'panel' ? 'panel.html' : process.env.PAGE === 'wall' ? 'wall.html' : 'index.html'
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { rollupOptions: { input: page }, emptyOutDir: page === 'index.html' },
})
