import React from 'react';

// 간단한 모달 스타일 (실제로는 더 꾸며야 함)
const modalStyle = {
  position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  backgroundColor: 'white', padding: '20px', zIndex: 1000,
  border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
};
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
};

export default function FeedbackActionModal({
    isOpen,
    onClose,
    feedback, // 현재 다루고 있는 피드백 객체
    onEdit,
    onRequestPublication,
    onFinalizeNonPublic
}) {
    if (!isOpen || !feedback) return null;

    return (
        <>
            <div style={overlayStyle} onClick={onClose} />
            <div style={modalStyle}>
                <h4>피드백 액션 선택 (ID: {feedback.id})</h4>
                <p>어떤 작업을 하시겠습니까?</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    {/* onEdit 핸들러는 feedback.id, feedback.class_id, feedback.user_id를 모두 알고 있으므로,
                      페이지 컴포넌트에서 navigate할 때 이 정보들을 활용할 수 있습니다.
                      handleEditFeedback(feedback.id, feedback.class_id, feedback.user_id)
                    */}
                    <button onClick={onEdit}>피드백 수정</button>
                    <button onClick={onRequestPublication}>공개 요청</button>
                    <button onClick={onFinalizeNonPublic}>미공개 확정</button>
                </div>
                <button onClick={onClose} style={{ marginTop: '20px' }}>닫기</button>
            </div>
        </>
    );
}