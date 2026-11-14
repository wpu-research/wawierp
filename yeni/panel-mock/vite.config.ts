import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Tek dosyalık çıktı: dist/index.html çift tıklamayla açılır, sunucu gerekmez.
export default defineConfig({ plugins: [react(), tailwindcss(), viteSingleFile()] })
