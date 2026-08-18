import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: '/homePage/',
  server: {
    port: 5678,
    strictPort: true,
    host: '0.0.0.0',
  },
  preview: {
    port: 5678,
    strictPort: true,
    host: '0.0.0.0',
  },
  plugins: [
    vue(),
    {
      name: 'spa-404',
      closeBundle() {
        const index = resolve(root, 'dist/index.html')
        if (existsSync(index)) {
          copyFileSync(index, resolve(root, 'dist/404.html'))
        }
      },
    },
  ],
})
