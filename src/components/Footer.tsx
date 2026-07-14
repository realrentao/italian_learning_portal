import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { NAV_ITEMS } from './NavBar';

// 页脚：展示站点信息、导航快捷入口与版权声明
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 4,
        px: 2,
        backgroundColor: '#0d2235',
        color: 'rgba(255,255,255,0.85)',
      }}
    >
      <Box className="container mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            意大利语学习门户 · Italian Learning Portal
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            词汇 · 动词变位 · 听力练习 · 习语，离线可用。
          </Typography>
        </Box>
        <Box className="flex flex-wrap gap-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              component={RouterLink}
              to={item.path}
              underline="hover"
              sx={{ color: 'inherit', opacity: 0.85, fontSize: 14 }}
            >
              {item.label}
            </Link>
          ))}
        </Box>
      </Box>
      <Box className="container mx-auto mt-3">
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          © {new Date().getFullYear()} 意大利语学习门户 · 仅供学习使用
        </Typography>
      </Box>
    </Box>
  );
}
