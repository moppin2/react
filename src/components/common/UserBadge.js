// src/components/common/UserBadge.jsx
import React, { useState, useRef } from 'react';
import './UserBadge.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ActionPopoverMenu from './ActionPopoverMenu';


const getUserLabel = (userType) => {
    switch (userType) {
        case 'admin':
            return '관리자';
        case 'instructor':
            return '강사';
        default:
            return '일반';
    }
};

export default function UserBadge({
    user,
    avatarUrl,
    showUserType = true,
    onSendMessage
}) {
    const { user: loggedInUser, logout } = useAuth();
    const navigate = useNavigate();

    const [menuAnchorEl, setMenuAnchorEl] = useState(null); // 팝오버 메뉴의 기준점 (DOM 요소)
    const badgeRef = useRef(null); // UserBadge의 최상위 div를 참조할 ref

    const isMenuOpen = Boolean(menuAnchorEl);

    const generateMenuItems = () => { /* ... (이전과 동일한 메뉴 아이템 생성 로직) ... */
        const items = [];
        if (!user || !user.id) return items;
        const displayName = user.name || user.username || '사용자';
        const isCurrentUser = loggedInUser && loggedInUser.id === user.id && loggedInUser.userType === user.userType;

        if (isCurrentUser) {
            items.push({ label: '내 프로필 보기', action: () => navigate(`/profile/${user.userType}/${user.id}`) });
            items.push({ label: '프로필 수정', action: () => navigate(`/profile/edit`) });
            items.push({ isSeparator: true });
            items.push({
                label: '로그아웃',
                action: async () => { if (logout) await logout(); navigate('/'); }
            });
        } else if (loggedInUser) {
            items.push({ label: `${displayName} 프로필 보기`, action: () => navigate(`/profile/${user.userType}/${user.id}`) });
            if (onSendMessage) {
                items.push({ label: `${displayName}에게 쪽지 보내기`, action: () => onSendMessage(user) });
            }
        } else {
            items.push({ label: `${displayName} 프로필 보기`, action: () => navigate(`/profile/${user.userType}/${user.id}`) });
        }
        return items;
    };

    const currentMenuItems = generateMenuItems();

    const handleBadgeClick = (event) => {
        if (currentMenuItems.length === 0) return;

        // badgeRef.current가 클릭된 요소(event.currentTarget)와 같은지 확인하여 토글
        if (menuAnchorEl === badgeRef.current && isMenuOpen) {
            setMenuAnchorEl(null);
        } else {
            setMenuAnchorEl(badgeRef.current); // ref의 현재 DOM 요소를 앵커로 설정
        }
    };

    const handleCloseMenu = () => {
        setMenuAnchorEl(null);
    };

    if (!user || !user.id) return null;

    const label = getUserLabel(user.userType);
    const displayName = user.name || user.username || '사용자';
    const initial = displayName ? displayName[0].toUpperCase() : '';

    return (
        <>
            <div
                ref={badgeRef} // <<--- 여기에 ref 연결
                className={`user-badge ${currentMenuItems.length > 0 ? 'clickable' : ''}`}
                onClick={currentMenuItems.length > 0 ? handleBadgeClick : undefined}
                style={currentMenuItems.length > 0 ? { cursor: 'pointer' } : {}}
                aria-haspopup={currentMenuItems.length > 0 ? "true" : undefined}
                aria-expanded={isMenuOpen}
                tabIndex={currentMenuItems.length > 0 ? 0 : undefined}
                onKeyDown={(e) => {
                    if (currentMenuItems.length > 0 && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleBadgeClick(e); // 이벤트 객체 전달 (currentTarget 사용 위해)
                    }
                }}
                role={currentMenuItems.length > 0 ? "button" : undefined}
            >
                {avatarUrl ? (
                    <img className="user-badge__avatar" src={avatarUrl} alt={`${displayName} 프로필`} />
                ) : (
                    <span className="user-badge__avatar placeholder">{initial}</span>
                )}
                <span className="user-badge__name">{displayName}</span>
                {showUserType && user.userType && (
                    <span className={`user-badge__label user-badge__label--${user.userType}`}>{label}</span>
                )}
            </div>

            {currentMenuItems.length > 0 && (
                <ActionPopoverMenu
                    anchorElement={menuAnchorEl} // <<--- 상태로 관리되는 DOM 요소 전달
                    isOpen={isMenuOpen}
                    onClose={handleCloseMenu}
                    menuItems={currentMenuItems}
                    placement="bottom-start"
                />
            )}
        </>
    );
}
