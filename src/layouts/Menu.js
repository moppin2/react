import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserBadge from '../components/common/UserBadge';
import data from '../assets/data/dummy.json';

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { ColorModeContext } from '../App';

// 아이콘 임포트
import SearchIcon from '@mui/icons-material/Search';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const getIconByName = (name) => {
  switch (name) {
    case '과정검색': return <SearchIcon />;
    case '과정관리': return <ListAltIcon />;
    case '수업관리': return <SchoolIcon />;
    case '수강생관리': return <GroupIcon />;
    default: return <HelpOutlineIcon />;
  }
};

export default function Menu() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const mode = theme.palette.mode;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) return null;

  const renderMenuItems = (type = '') =>
    data.menu
      .filter((item) => item.type === type && item.active)
      .map((item) => ({
        ...item,
        icon: getIconByName(item.name),
        isActive: location.pathname === item.link,
      }));

  const menuItems = [
    ...renderMenuItems(''),
    ...(user ? renderMenuItems(user.userType) : []),
  ];

  const primary = theme.palette.primary.main;
  const selectedBg = alpha(primary, 0.1);
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const bgPaper = theme.palette.background.paper;
  const divider = theme.palette.divider;

  return (
    <>
      {/* 모바일 상단 AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ bgcolor: bgPaper }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ color: textPrimary, textDecoration: 'none', flexGrow: 1 }}
            >
              Open9
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', color: textPrimary }}>
              {/* 테마 토글 */}
              <IconButton onClick={colorMode.toggleMode} color="inherit">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              {user ? (
                <UserBadge user={user} avatarUrl={user.avatarUrl} />
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{ color: textPrimary, fontSize: '0.8rem', ml: 1 }}
                  >로그인</Button>
                  <Button
                    component={Link}
                    to="/register"
                    sx={{ color: primary, fontSize: '0.8rem', ml: 1 }}
                  >회원가입</Button>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* 데스크탑 사이드바 */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              bgcolor: bgPaper,
              color: textPrimary,
              borderRight: 0,
            },
          }}
        >
          <Box sx={{ p: 2, fontWeight: 'bold', fontSize: 18, color: primary }}>
            Open9
          </Box>
          <List>
            {menuItems.map((item, idx) => (
              <ListItemButton
                key={idx}
                component={Link}
                to={item.link}
                selected={item.isActive}
                sx={{
                  color: item.isActive ? primary : textSecondary,
                  bgcolor: item.isActive ? selectedBg : 'transparent',
                  '&:hover': { bgcolor: alpha(primary, 0.05) },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            ))}
            {/* 테마 토글 버튼 */}
            <ListItemButton
              onClick={colorMode.toggleMode}
              sx={{
                color: textSecondary,
                mt: 1,
                '&:hover': { bgcolor: alpha(primary, 0.05) },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText primary={mode === 'dark' ? '라이트 모드' : '다크 모드'} />
            </ListItemButton>
          </List>
          <Box sx={{ p: 2, mt: 'auto' }}>
            {user ? (
              <UserBadge user={user} avatarUrl={user.avatarUrl} />
            ) : (
              <>
                <Box
                  component={Link}
                  to="/register"
                  sx={{ color: primary, display: 'block', mb: 1 }}
                >회원가입</Box>
                <Box
                  component={Link}
                  to="/login"
                  sx={{ color: textPrimary, display: 'block' }}
                >로그인</Box>
              </>
            )}
          </Box>
        </Drawer>
      )}

      {/* 모바일 하단 네비게이션 */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: bgPaper,
            display: 'flex',
            justifyContent: 'space-around',
            borderTop: `1px solid ${divider}`,
            py: 0.75,
            zIndex: theme.zIndex.appBar,
          }}
        >
          {menuItems.map((item, idx) => (
            <Button
              key={idx}
              component={Link}
              to={item.link}
              disableRipple
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: 'auto',
                fontSize: '0.7rem',
                color: item.isActive ? primary : textSecondary,
                bgcolor: item.isActive ? selectedBg : 'transparent',
                '&:hover, &:active': { bgcolor: selectedBg, color: primary },
              }}
            >
              {item.icon}
              {item.name}
            </Button>
          ))}
        </Box>
      )}
    </>
  );
}
