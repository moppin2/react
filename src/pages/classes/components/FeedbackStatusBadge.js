import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../../components/common/StatusBadge';
import ActionPopoverMenu from '../../../components/common/ActionPopoverMenu';
import api from '../../../services/api';

// 이 컴포넌트는 부모로부터 feedback 객체, 사용자 역할(role), 관련 핸들러 함수들을 props로 받습니다.
export default function FeedbackStatusBadge({
    feedback,      // 피드백 객체 (null일 수 있음)
    role,          // 'instructor' 또는 'student'
    classId,       // 현재 수업 ID (액션에 필요할 수 있음)
    studentId,     // 피드백 대상 학생 ID (액션에 필요할 수 있음, 강사 역할 시)
    refreshMyClasses,
}) {

    const [anchorEl, setAnchorEl] = useState(null);
    const [currentMenuItems, setCurrentMenuItems] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const navigate = useNavigate();

    const openMenuForFeedbackOpenRequest = (event, feedback) => {
        event.stopPropagation(); // 다른 이벤트 전파 방지

        let itemsConfig = [];
        itemsConfig.push({ label: '피드백 보기', action: () => handleViewFeedbackDetails(feedback.id)});
        itemsConfig.push({ label: '공개승인', action: () => handleApproveFeedbackPublication(feedback.id)});
        itemsConfig.push({ label: '공개거절', action: () => handleRejectFeedbackPublication(feedback.id)});

        openMenu(event, itemsConfig);
    };

    const openMenuForFeedbackAction = (event, feedback) => {
        event.stopPropagation(); // 다른 이벤트 전파 방지

        let itemsConfig = [];
        itemsConfig.push({ label: '피드백 수정', action: () => navigate(`/feedback/edit/${feedback.id}`) });
        itemsConfig.push({ label: '공개요청', action: () => handleRequestPublication(feedback.id) });
        itemsConfig.push({ label: '미공개 확정', action: () => handleFinalizeNonPublic(feedback.id) });

        openMenu(event, itemsConfig);
    };

    const openMenu = (event, itemsConfig) => {
        if (itemsConfig.length > 0) {
            if (anchorEl === event.currentTarget && isMenuOpen) { // 토글 기능
                setAnchorEl(null);
            } else {
                setAnchorEl(event.currentTarget);
                setCurrentMenuItems(itemsConfig);
            }
        }
    };

    const closeMenu = () => {
        setAnchorEl(null);
    };
    
    const handleWriteFeedback = (classId, userId) => {
        navigate(`/class/${classId}/feedback/${userId}`);
    };
    

    const handleViewFeedbackDetails = (feedbackId) => {
        console.log(`Viewing details for feedback ID: ${feedbackId}`);
    };

    const handleApiAction = async (apiCall, successMessage, failureMessage, reservationIdForLoading = null) => {
        if (reservationIdForLoading) setActionLoading(reservationIdForLoading);
        else setActionLoading(true); // 일반 액션 로딩
        try {
            await apiCall();
            if (successMessage) alert(successMessage);
            await refreshMyClasses();
        } catch (err) {
            alert(err.response?.data?.message || failureMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRequestPublication = async (feedbackId) => {
        await handleApiAction(
            () => api.put(`/api/class-feedbacks/${feedbackId}/request-publication`),
            '공개 요청을 보냈습니다.',
            '공개 요청 실패',
            `feedback-${feedbackId}` // 로딩 상태를 위한 고유 ID
        );
    };

    const handleFinalizeNonPublic = async (feedbackId) => {
        await handleApiAction(
            () => api.put(`/api/class-feedbacks/${feedbackId}/finalize-non-public`),
            '미공개로 확정되었습니다.',
            '미공개 확정 실패',
            `feedback-${feedbackId}`
        );
    };
    

    const handleApproveFeedbackPublication = async (feedbackId) => {
        await handleApiAction(
            () => api.put(`/api/class-feedbacks/${feedbackId}/approve-publication`),
            '공개요청을 승인하였습니다.',
            '공개요청 승인 실패',
            `feedback-${feedbackId}`
        );

    }

    const handleRejectFeedbackPublication = async (feedbackId) => {
        await handleApiAction(
            () => api.put(`/api/class-feedbacks/${feedbackId}/reject-publication`),
            '공개요청을 거절하였습니다.',
            '공개요청 거절 실패',
            `feedback-${feedbackId}`
        );

    }

    // 상태별 텍스트, 스타일, 액션 결정 로직
    let badgeText = '';
    let badgeStyle = 'default'; // CSS 클래스용
    let actionSymbol = null; // 아이콘 대신 사용할 간단한 기호 또는 텍스트⚙️👁️▶️
    let actionHandler = null;

    if (role === 'instructor') {
        if (!feedback) {
            badgeText = '피드백 작성';
            badgeStyle = 'action-need'; // 'action-write' 클래스 추가하여 클릭 유도
            actionSymbol = '+'
            actionHandler = () => handleWriteFeedback(classId, studentId);
        } else if (feedback.is_publication_requested === null) {
            badgeText = '피드백 임시저장';
            badgeStyle = 'action-need';
            actionSymbol = '+';
            actionHandler = (event) => openMenuForFeedbackAction(event, feedback);
        } else if (feedback.is_publication_requested === true && !feedback.publish_approved && !feedback.publish_rejected) {
            badgeText = '피드백 공개요청중';
            badgeStyle = 'action-waiting';
            actionSymbol = '';
            actionHandler = () => handleViewFeedbackDetails(feedback.id);
        } else if (feedback.publish_approved === true) {
            badgeText = '공개피드백';
            badgeStyle = 'complete';
            actionSymbol = '';
            actionHandler = () => handleViewFeedbackDetails(feedback.id);
        } else if (feedback.publish_rejected === true) {
            badgeText = '비공개피드백';
            badgeStyle = 'complete';
            actionSymbol = '';
            actionHandler = () => handleViewFeedbackDetails(feedback.id);
        } else if (feedback.is_publication_requested === false) {
            badgeText = '비공개피드백';
            badgeStyle = 'complete';
            actionSymbol = '';
            actionHandler = () => handleViewFeedbackDetails(feedback.id);
        } else {
            badgeText = '상태 확인 필요';
            badgeStyle = 'default';
            actionSymbol = '';
            actionHandler = () => handleViewFeedbackDetails(feedback.id);
        }
    } else if (role === 'student') {
        if (!feedback || feedback.is_publication_requested === null) {
            badgeText = '피드백 작성중';
            badgeStyle = 'action-waiting';
            actionSymbol = '';
            actionHandler = () => { };
        } else if (feedback.is_publication_requested === true && !feedback.publish_approved && !feedback.publish_rejected) {
            badgeText = '피드백 공개요청';
            badgeStyle = 'action-need';
            actionSymbol = '+';
            actionHandler = (event) => { openMenuForFeedbackOpenRequest(event, feedback) };
        } else if (feedback.publish_approved === true && feedback.is_public === true) {
            badgeText = '공개피드백';
            badgeStyle = 'complete';
            actionSymbol = '';
            actionHandler = () => handleViewFeedbackDetails(feedback.id);
        } else if (feedback.publish_rejected === true) {
            badgeText = '비공개피드백';
            badgeStyle = 'complete';
            actionSymbol = '';
            actionHandler = () => handleViewFeedbackDetails(feedback.id);
        } else if (feedback.is_publication_requested === false) {
            badgeText = '비공개피드백';
            badgeStyle = 'complete';
            actionSymbol = '';
            actionHandler = () => handleViewFeedbackDetails(feedback.id);
        } else {
            badgeText = '피드백 확인';
            badgeStyle = 'complete';
            actionSymbol = '';
            actionHandler = () => handleViewFeedbackDetails(feedback.id);
        }
    }

    if (actionLoading) return <div>Loading...</div>;
    return (
        <>
            <StatusBadge
                status={badgeStyle}
                badgeText={badgeText}
                actionSymbol={actionSymbol}
                actionHandler={actionHandler}
            />

            <ActionPopoverMenu
                anchorElement={anchorEl}
                isOpen={isMenuOpen}
                onClose={closeMenu}
                menuItems={currentMenuItems}
                placement="bottom-start"
            />
        </>
    );
}