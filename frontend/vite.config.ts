import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      proxy: {
        '/api': 'http://localhost:5000'
      }
    }
  }
});