import { io } from 'socket.io-client';
import api from './api';

let socket = null;
let currentToken = null;

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

export function connectSocket(token) {
  currentToken = token;

  // 이미 연결되어 있으면 끊고 재생성
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token: currentToken },
    transports: ['websocket'],
    withCredentials: true,
  });

  // 인증 성공
  socket.on('connect', () => {
    console.log('Socket.IO: 연결됨 (ID:', socket.id, ')');
  });

  // 서버가 강제로 끊었을 때
  socket.on('disconnect', (reason) => {
    console.log('Socket.IO: 연결 해제 (이유:', reason, ')');
  });

  // 인증 오류가 날 때
  socket.on('connect_error', async (err) => {
    console.warn('Socket.IO: connect_error:', err.message);
    if (err.message.includes('Authentication error')) {
      try {
        // 1) refresh API 호출해서 새 토큰 받기
        const res = await api.post('/refresh');
        const newToken = res.data.accessToken;

        // 2) HTTP axios 인스턴스에도 갱신된 토큰 설정
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // 3) 소켓 완전 재생성
        connectSocket(newToken);

      } catch (refreshErr) {
        console.error('Socket.IO: 토큰 갱신 실패, 로그아웃 처리 필요', refreshErr);
        // TODO: 강제 로그아웃 또는 로그인 페이지로 리다이렉트
      }
    }
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

export function emitEvent(eventName, data) {
  if (socket && socket.connected) {
    socket.emit(eventName, data);
  }
}

export function onEvent(eventName, cb) {
  if (!socket) return () => {};
  socket.on(eventName, cb);
  return () => socket.off(eventName, cb);
}
