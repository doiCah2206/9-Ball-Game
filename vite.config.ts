import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@dimforge/rapier2d-compat']
  }
})