import { defineConfig } from 'vite'
import wasmPlugin from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [wasmPlugin()],
  optimizeDeps: {
    exclude: ['@dimforge/rapier2d']
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  },
  build: {
    target: 'es2020'
  }
})
