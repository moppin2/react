import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Menu from './Menu';
import { useTheme } from '@mui/material/styles';

export default function MainLayout() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Menu />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            height: '100%',
            bgcolor: theme.palette.background.default,
          }}
        >
          <Outlet />
        </Box>
        {/* 모바일 하단 메뉴가 필요하다면 여기에 추가 */}
      </Box>
    </Box>
  );
}
