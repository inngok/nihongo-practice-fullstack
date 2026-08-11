import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8888,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Tăng warning limit lên 1MB để tránh noise
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('xlsx')) {
              return 'vendor-xlsx'; // Tách riêng thư viện nặng
            }
            return 'vendor'; // Gom chung react, antd và các thư viện khác để tránh lỗi mất context hoặc duplicate react
          }
        },
      },
    },
    // Bật minification tốt hơn
    minify: 'esbuild',
    target: 'es2020',
  },
});
