import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Vite 配置
// - base 适配 GitHub Pages 的仓库子路径 /italian_learning_portal/
// - alias '@/' 指向 src/，便于模块化引用
export default defineConfig({
  base: '/italian_learning_portal/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
