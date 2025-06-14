import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { visualizer } from "rollup-plugin-visualizer"; // Import it

// https://vite.dev/config/
export default defineConfig({
  plugins: [ tailwindcss(),react(), visualizer({ open: true })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
