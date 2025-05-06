import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //앱시작 시 로그인 상태 체크
  useEffect(() => {
    (async () => {
      try {
        await api.post('/refresh');
        const { data } = await api.get('/me');
        setUser(data);
      } catch (err) {
        console.log('로그인 안됨:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  const login = async (credentials) => {
    try {
      const res = await api.post('/login', credentials);
      setUser(res.data);
    } catch (err) {        
      const message =
        err.response?.data?.message || '이메일과 패스워드를 확인하세요.';
      throw new Error(message);
    }
  };

  const logout = async () => { 
    await api.post('/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}