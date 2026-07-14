import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { FavoritesProvider } from './context/FavoritesContext';

// 全局主题：以意大利国旗三色（绿/白/红）为灵感定义品牌色
const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#c62828' },
    background: { default: '#f7f9fc' },
  },
  typography: {
    fontFamily:
      '"Roboto", "Helvetica", "Arial", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  shape: { borderRadius: 12 },
});

// 应用根入口：
// 1. ThemeProvider 提供 MUI 主题
// 2. CssBaseline 统一基础样式（preflight 已关闭，这里仅做 MUI 的基础归一）
// 3. BrowserRouter 使用 basename 适配 GitHub Pages 子路径
// 4. 注入全局音频播放器与收藏上下文
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('未找到 #root 挂载节点');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AudioPlayerProvider>
        <FavoritesProvider>
          <BrowserRouter basename="/italian_learning_portal">
            <App />
          </BrowserRouter>
        </FavoritesProvider>
      </AudioPlayerProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
