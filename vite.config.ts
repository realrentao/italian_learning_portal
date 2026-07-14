import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';
import { existsSync, copyFileSync } from 'node:fs';

// 项目根目录（兼容 Windows 与 ESM 环境）
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// 构建输出目录（默认 dist，可被 --outDir 覆盖），供 SPA fallback 插件使用
let resolvedOutDir = path.resolve(projectRoot, 'dist');

// Vite 配置
// - base 适配 GitHub Pages 的仓库子路径 /italian_learning_portal/
// - alias '@/' 指向 src/，便于模块化引用
// - 构建结束后将 index.html 复制为 404.html，作为 SPA fallback：
//   GitHub Pages 不会自动重写未知路径到 index.html，刷新或直链子路由
//   （如 /italian_learning_portal/vocabulary）会返回 404 从而白屏；
//   用 404.html 兜底后，服务端返回该文件，前端路由再接管渲染。
export default defineConfig({
  base: '/italian_learning_portal/',
  plugins: [
    react(),
    {
      name: 'spa-fallback-404',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = path.resolve(projectRoot, config.build.outDir);
      },
      closeBundle() {
        const indexHtml = path.join(resolvedOutDir, 'index.html');
        const fallbackHtml = path.join(resolvedOutDir, '404.html');
        if (existsSync(indexHtml)) {
          copyFileSync(indexHtml, fallbackHtml);
        }
      },
    },
  ],
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
