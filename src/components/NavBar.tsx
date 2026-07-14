import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import FlagIcon from '@mui/icons-material/Flag';

// 导航项配置：path 与 App.tsx 中的路由保持一致，label 为中意双语
export const NAV_ITEMS: { path: string; label: string; labelIt: string }[] = [
  { path: '/', label: '首页', labelIt: 'Home' },
  { path: '/vocabulary', label: '词汇', labelIt: 'Vocabolario' },
  { path: '/verbs', label: '动词变位', labelIt: 'Congiugazione' },
  { path: '/exercises', label: '听力练习', labelIt: 'Esercizi' },
  { path: '/idioms', label: '习语', labelIt: 'Modi di dire' },
];

// 顶部导航栏
// 桌面端：横向按钮；窄屏（<600px）：折叠为抽屉菜单
export default function NavBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // 判断当前路由是否高亮
  const isActive = (path: string): boolean =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const drawer = (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
    >
      <Box
        sx={{ width: 240 }}
        role="presentation"
        onClick={() => setDrawerOpen(false)}
      >
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isActive(item.path)}
              >
                <ListItemText
                  primary={item.label}
                  secondary={item.labelIt}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="sticky" color="primary" enableColorOnDark>
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="打开菜单"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <FlagIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          意大利语学习门户
        </Typography>

        {!isMobile &&
          NAV_ITEMS.map((item) => (
            <Button
              key={item.path}
              component={RouterLink}
              to={item.path}
              color="inherit"
              sx={{
                mx: 0.5,
                fontWeight: isActive(item.path) ? 700 : 400,
                borderBottom: isActive(item.path)
                  ? '2px solid #fff'
                  : '2px solid transparent',
                borderRadius: 0,
              }}
            >
              {item.label}
            </Button>
          ))}
      </Toolbar>
      {isMobile && drawer}
    </AppBar>
  );
}
