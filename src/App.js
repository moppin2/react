// src/App.js
import './App.css';
import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import { usePushNotification } from './hooks/usePushNotification';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

// theme 관련
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { getAppTheme } from './theme';

import MainLayout from './layouts/MainLayout';
import routes from './routes';

// ① Context 생성 및 export
export const ColorModeContext = React.createContext({
  toggleMode: () => {},
});

function App() {
  usePushNotification();

  // ② 시스템 프리퍼런스에 따라 초기 모드 결정
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDark ? 'dark' : 'light');

  // ③ mode 변경 시 테마 객체 재생성
  const theme = useMemo(() => getAppTheme(mode), [mode]);

  // ④ toggleMode 함수
  const colorMode = useMemo(
    () => ({
      toggleMode: () => {
        setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
      },
    }),
    []
  );

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapacitorApp.exitApp();
        }
      });
      return () => {
        listener.remove();
      };
    }
  }, []);

  return (
    // ⑤ Context.Provider로 감싸기
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path='/' element={<MainLayout />}>
                {routes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
