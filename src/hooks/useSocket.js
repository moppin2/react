import { useCallback, useMemo } from 'react';
import { getSocket } from '../services/socketService';

/**
 * Socket 서비스의 emit/on 기능을 컴포넌트에서 간단히 사용할 수 있도록 도와주는 커스텀 훅.
 */
export function useSocket() {
  const socket = getSocket();

  const emit = useCallback((event, payload) => {
    if (socket && socket.connected) {
      socket.emit(event, payload);
    } else {
      console.warn(`Emit 실패 - 소켓 연결 안 됨. event: ${event}`);
    }
  }, [socket]);

  const on = useCallback((event, handler) => {
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [socket]);

  return useMemo(() => ({ socket, emit, on }), [socket, emit, on]);
}
