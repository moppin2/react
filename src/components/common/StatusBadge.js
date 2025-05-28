import React from 'react';
import './StatusBadge.css'

// 이 컴포넌트는 부모로부터 feedback 객체, 사용자 역할(role), 관련 핸들러 함수들을 props로 받습니다.
export default function FeedbackStatusBadge({
    status,
    badgeText,
    actionSymbol,
    actionHandler,
    title,
}) {
    // const clickableClass = actionHandler ? 'clickable' : '';

    // actionHandler가 event 객체를 첫 번째 인자로 받도록 수정 (중요)
    const handleClick = (event) => {
        if (actionHandler) {
            actionHandler(event); // event 객체를 전달
        }
    };

    return (
        <div className={`status-badge ${status}`}
            onClick={actionHandler}
            title={title || badgeText}
            tabIndex={actionHandler ? 0 : undefined} // 클릭 가능하면 키보드 포커스 가능
            onKeyDown={actionHandler ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); } : undefined}
            role={actionHandler ? 'button' : undefined}
        >
            {actionSymbol && <span className="badge-symbol">{actionSymbol}</span>}
            <span className="badge-text">{badgeText}</span>
        </div>
    );
}