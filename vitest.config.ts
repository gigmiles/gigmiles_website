import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
    // Installed skills under .claude/ ship their own test files; they are not ours to run.
    exclude: ['**/node_modules/**', '**/.claude/**', '**/.next/**', '**/dist/**'],
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
