import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../../components/common/StatusBadge';

// 이 컴포넌트는 부모로부터 feedback 객체, 사용자 역할(role), 관련 핸들러 함수들을 props로 받습니다.
export default function ReviewStatusBadge({
    review,      // 리뷰 객체 (null일 수 있음)
    role,          // 'instructor' 또는 'student'
    classId,       // 현재 수업 ID (액션에 필요할 수 있음)
    studentId,     // 피드백 대상 학생 ID (액션에 필요할 수 있음, 강사 역할 시)
}) {
    const navigate = useNavigate();

    const handleWriteReview = (classId) => {
        navigate(`/review/write/${classId}`);
    };

    // 상태별 텍스트, 스타일, 액션 결정 로직
    let badgeText = '';
    let badgeStyle = 'default'; // CSS 클래스용
    let actionSymbol = null; // 아이콘 대신 사용할 간단한 기호 또는 텍스트⚙️👁️▶️
    let actionHandler = null;

    if (role === 'instructor') {
        if (!review) {
            badgeText = '리뷰없음';
            badgeStyle = 'action-waiting';
            actionSymbol = '';
            actionHandler = () => { };
        } else {
            if(review.is_public){
                badgeText = '공개리뷰';
            }else{                
                badgeText = '비공개리뷰';
            }
            
            badgeStyle = 'complete';
            actionSymbol = ''
            actionHandler = () => { };
        }
    } else if (role === 'student') {
        if (!review) {
            badgeText = '리뷰작성';
            badgeStyle = 'action-need';
            actionSymbol = ''
            actionHandler = () => handleWriteReview(classId);
        } else {
            badgeText = '리뷰완료';
            badgeStyle = 'complete';
            actionSymbol = ''
            actionHandler = () => { };
        }
    }

    return (
        <>
            <StatusBadge
                status={badgeStyle}
                badgeText={badgeText}
                actionSymbol={actionSymbol}
                actionHandler={actionHandler}
            />
        </>
    );
}