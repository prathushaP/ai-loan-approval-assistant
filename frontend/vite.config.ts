import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.GITHUB_PAGES === 'true' ? '/ai-loan-approval-assistant/' : '/',
  server: { port: 5173 },
})
