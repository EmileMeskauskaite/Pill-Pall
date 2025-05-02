import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/**/*.jsx',
        'src/components/buttons/**/*.jsx',
        'src/components/notifications/**/*.jsx'
      ],
      exclude: [
        'src/components/forms/**/*.jsx', 
        'src/pages/**/*.jsx',
        'node_modules/**',
        'src/test/**'
      ],
      thresholds: {
        statements: 50,
        branches: 70,
        functions: 50,
        lines: 50,
        perFile: false
      }
    },
  },
})
