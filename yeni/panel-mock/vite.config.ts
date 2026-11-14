import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// İki ayrı tek dosyalık çıktı: index.html (açık ana sayfa) ve panel.html (şifreli panel).
// Ayrı derlenir ki ana sayfa paketi panel verisini hiç içermesin.
const page = process.env.PAGE === 'panel' ? 'panel.html' : 'index.html'
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { rollupOptions: { input: page }, emptyOutDir: page === 'index.html' },
})
