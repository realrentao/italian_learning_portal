import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import NavBar from './NavBar';
import Footer from './Footer';

// 整体布局容器
// - 顶部固定导航栏
// - 中间为主内容（限制最大宽度，移动端自适应）
// - 底部页脚
interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box className="flex min-h-screen flex-col bg-[#f7f9fc]">
      <NavBar />
      <Box component="main" className="flex-1">
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
