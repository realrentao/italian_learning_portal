/** @type {import('tailwindcss').Config} */
// Tailwind × MUI 共存策略：
// 关闭 preflight，避免重置 MUI 组件的基础样式（如按钮、列表）。
// 布局类（flex/grid/间距/响应式）由 Tailwind 负责，外观由 MUI 的 sx/theme 负责。
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1565c0',
          secondary: '#c62828',
          accent: '#00897b',
        },
      },
    },
  },
  plugins: [],
};
