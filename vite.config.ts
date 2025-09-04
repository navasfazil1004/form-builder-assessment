import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// Only enable devtools for actual Vite dev, not Storybook
const isStorybook = process.env.STORYBOOK === 'true'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // Only enable Vue DevTools in local dev
    !isStorybook && (await import('vite-plugin-vue-devtools')).default(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
