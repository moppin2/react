import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import UserBadge from '../../components/common/UserBadge';
import api from '../../services/api';
import './ChatRoom.css';

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const { socket, emit, on } = useSocket();
  const navigate = useNavigate();

  const [roomDetails, setRoomDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [lastReceivedAt, setLastReceivedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const containerRef = useRef(null);

  const participantsMap = useMemo(
    () =>
      participants.reduce((map, p) => {
        map[p.user_id] = p;
        return map;
      }, {}),
    [participants]
  );

  const scrollToBottom = () => {
    const c = containerRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  };

  const loadRoomDetails = useCallback(async () => {
    const res = await api.get(`/api/chat/rooms/${roomId}`);
    setRoomDetails(res.data.room);
    setParticipants(res.data.participants || []);
  }, [roomId]);

  const loadInitialMessages = useCallback(async () => {
    setIsLoading(true);
    const res = await api.get(`/api/chat/rooms/${roomId}/messages?limit=20`);
    const fetched = res.data.map(msg => ({
      id: msg.id,
      chat_room_id: msg.chat_room_id,
      sender_id: msg.sender_id,
      content: msg.content,
      created_at: msg.created_at
    }));
    setMessages(fetched);
    if (fetched.length) {
      setLastReceivedAt(
        new Date(fetched[fetched.length - 1].created_at).toISOString()
      );
    }
    setIsLoading(false);
  }, [roomId]);

  const loadNewMessages = useCallback(async () => {
    if (!lastReceivedAt) return;
    setIsLoading(true);
    const res = await api.get(
      `/api/chat/rooms/${roomId}/messages?after=${encodeURIComponent(
        lastReceivedAt
      )}`
    );
    const fetched = res.data.map(msg => ({
      id: msg.id,
      chat_room_id: msg.chat_room_id,
      sender_id: msg.sender_id,
      content: msg.content,
      created_at: msg.created_at
    }));
    setMessages(prev => {
      const seen = new Set(prev.map(m => m.id));
      return [...prev, ...fetched.filter(m => !seen.has(m.id))];
    });
    if (fetched.length) {
      setLastReceivedAt(
        new Date(fetched[fetched.length - 1].created_at).toISOString()
      );
    }
    setIsLoading(false);
  }, [roomId, lastReceivedAt]);

  const loadOlderMessages = useCallback(async () => {
    if (isLoading || !messages.length) return;
    setIsLoading(true);
    const oldest = messages[0].created_at;
    const query = `?before=${encodeURIComponent(oldest)}&limit=20`;
    const res = await api.get(
      `/api/chat/rooms/${roomId}/messages${query}`
    );
    const fetched = res.data.map(msg => ({
      id: msg.id,
      chat_room_id: msg.chat_room_id,
      sender_id: msg.sender_id,
      content: msg.content,
      created_at: msg.created_at
    }));
    setMessages(prev => {
      const seen = new Set(prev.map(m => m.id));
      return [...fetched.filter(m => !seen.has(m.id)), ...prev];
    });
    setIsLoading(false);
  }, [roomId, messages, isLoading]);

  const handleScroll = useCallback(() => {
    const c = containerRef.current;
    if (!initialLoadDone || isLoading || !c) return;
    if (c.scrollTop < 50) {
      loadOlderMessages();
    }
  }, [initialLoadDone, isLoading, loadOlderMessages]);

  // ─── 첫 로드 & 로그인 체크 ───────────────────────────
  useEffect(() => {
    // 1) 인증 상태 로딩 중이면 기다리기
    if (authLoading) return;

    // 2) 로딩 끝났는데 로그인 안 됐으면 로그인 페이지로
    if (!user) {
      navigate('/login');
      return;
    }

    // 3) 소켓이 준비될 때까지 대기
    if (!socket) return;

    // 여기부터는 '로그인+소켓 준비'된 상태
    emit('join_room', { roomId });
    loadRoomDetails();
    (async () => {
      await loadInitialMessages();
      scrollToBottom();
      setInitialLoadDone(true);
    })();

    return () => {
      emit('leave_room', { roomId });
    };
  }, [
    authLoading,
    user,
    socket,
    roomId,
    navigate,
    emit,
    loadRoomDetails,
    loadInitialMessages
  ]);

  // ─── 재연결 시 놓친 메시지 로드 ───────────────────────
  useEffect(() => {
    if (!socket) return;
    const onConnect = () => {
      emit('join_room', { roomId });
      loadNewMessages();
    };
    socket.on('connect', onConnect);
    return () => {
      socket.off('connect', onConnect);
    };
  }, [socket, roomId, emit, loadNewMessages]);

  // ─── 라이브 수신 ────────────────────────────────────
  useEffect(() => {
    const offNew = on('new_chat_message', message => {
      if (message.roomId !== roomId) return;
      setMessages(prev => {
        const next = [
          ...prev,
          {
            id: message.id,
            chat_room_id: message.roomId,
            sender_id: message.sender.id,
            content: message.content,
            created_at: message.createdAt
          }
        ];
        setTimeout(scrollToBottom, 0);
        return next;
      });
    });
    return offNew;
  }, [on, roomId]);

  // ─── 초기 로드 끝난 뒤 스크롤 ─────────────────────────
  useEffect(() => {
    if (initialLoadDone) scrollToBottom();
  }, [initialLoadDone]);

  const handleSend = e => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    emit('send_chat_message', {
      roomId,
      content: newMessage,
      senderId: user.id
    });
    setNewMessage('');
  };

  if (authLoading || (!initialLoadDone && isLoading)) {
    return <p className="chat-loading">로딩 중...</p>;
  }
  if (!user) {
    return <p className="chat-info">채팅 기능을 사용하려면 로그인이 필요합니다.</p>;
  }

  return (
    <div className="chat-room-page">
      <header className="chat-room-header">
        <h2>{roomDetails?.name || `채팅방 ${roomId}`}</h2>
      </header>

      <div
        className="messages-container"
        ref={containerRef}
        onScroll={handleScroll}
      >
        <ul className="messages-list">
          {messages.map(msg => {
            const isMine = msg.sender_id === user.id;
            const sender = participantsMap[msg.sender_id] || {};
            return (
              <li
                key={msg.id}
                className={`message-item ${isMine ? 'sent' : 'received'}`}
              >
                <div className="message-sender">
                  {!isMine ? (
                    <UserBadge
                      user={{
                        id: sender.user_id,
                        userType: sender.user_type,
                        name: sender.name
                      }}
                      avatarUrl={sender.avatarUrl}
                      showUserType={false}
                    />
                  ) : (
                    <span>나</span>
                  )}
                </div>
                <div className="message-content">
                  <p>{msg.content}</p>
                </div>
                <span className="message-timestamp">
                  {new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <form className="message-form" onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          autoComplete="off"
        />
        <button type="submit" disabled={!newMessage.trim()}>
          전송
        </button>
      </form>
    </div>
  );
}
