import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socketService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [socketTokenForIO, setSocketTokenForIO] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const manageSocketConnection = () => {
            if (user && user.id && socketTokenForIO && typeof socketTokenForIO === 'string' && socketTokenForIO.trim() !== '') {
                connectSocket(socketTokenForIO);
            } else {
                disconnectSocket(); 
            }
        };

        if (!loading) { 
            manageSocketConnection();
        }
    }, [user, socketTokenForIO, loading]);

    useEffect(() => {
        const checkInitialAuth = async () => {
            setLoading(true);
            try {
                await api.post('/refresh'); 
                const { data } = await api.get('/me'); 
                
                if (data && data.id) {
                    setUser(data);
                    if (data.socketToken && typeof data.socketToken === 'string') {
                        setSocketTokenForIO(data.socketToken);
                    } else {
                        console.warn('AuthProvider: Socket token not found in /me response. Socket will not connect.');
                        setSocketTokenForIO(null);
                    }
                } else {
                    setUser(null);
                    setSocketTokenForIO(null);
                }
            } catch (err) {
                console.error("AuthProvider: Initial auth check failed or not logged in.", err.message);
                setUser(null);
                setSocketTokenForIO(null);
            } finally {
                setLoading(false);
            }
        };
        checkInitialAuth();
    }, []); // 앱 시작 시 한 번만 실행

    const login = useCallback(async (credentials) => {
        try {
            const response = await api.post('/login', credentials);
            const userData = response.data;

            if (userData && userData.id) {
                setUser({
                    id: userData.id,
                    userType: userData.userType,
                    name: userData.username,
                    email: userData.email,
                    avatarUrl: userData.avatarUrl,
                    status: userData.status
                });
                if (userData.socketToken && typeof userData.socketToken === 'string') {
                    setSocketTokenForIO(userData.socketToken);
                } else {
                    console.warn('AuthProvider: Socket token not found in login response. Socket will not connect.');
                    setSocketTokenForIO(null);
                }
                return userData;
            } else {
                throw new Error("로그인 응답에서 사용자 정보를 받지 못했습니다.");
            }
        } catch (err) {         
            const message = err.response?.data?.message || '이메일과 패스워드를 확인하세요.';
            setUser(null);
            setSocketTokenForIO(null);
            throw new Error(message);
        }
    }, []);

    const logout = useCallback(async () => { 
        try {
            await api.post('/logout'); // 서버에 로그아웃 알림 (쿠키 삭제 등)
        } catch (error) {
            console.error("서버 로그아웃 중 오류:", error);
        } finally {
            setUser(null);
            setSocketTokenForIO(null);
        }
    }, []);
    
    const manualLogin = useCallback((userDataWithTokens) => {
        // 이 함수는 외부에서 사용자 정보와 소켓 토큰을 직접 설정할 때 사용 (예: OAuth 콜백)
        // userDataWithTokens 객체에 user 정보와 socketToken이 모두 포함되어 있다고 가정
        if (userDataWithTokens && userDataWithTokens.id) {
            setUser({
                id: userDataWithTokens.id,
                userType: userDataWithTokens.userType,
                name: userDataWithTokens.username || userDataWithTokens.name,
                email: userDataWithTokens.email,
                avatarUrl: userDataWithTokens.avatarUrl,
                status: userDataWithTokens.status
            });
            if (userDataWithTokens.socketToken && typeof userDataWithTokens.socketToken === 'string') {
                setSocketTokenForIO(userDataWithTokens.socketToken);
            } else {
                console.warn('AuthProvider (manualLogin): Socket token not provided or invalid.');
                setSocketTokenForIO(null);
            }
        } else {
            setUser(null);
            setSocketTokenForIO(null);
        }
    }, []);

    const authValue = useMemo(() => ({ 
        user, 
        loading, 
        login, 
        logout, 
        manualLogin,
        isLoggedIn: !!user,
        socketTokenForIO
    }), [user, loading, login, logout, manualLogin, socketTokenForIO]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
