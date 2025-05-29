import React from 'react';
import { useState } from 'react';
import StatusBadge from '../../../components/common/StatusBadge';
import ActionPopoverMenu from '../../../components/common/ActionPopoverMenu';
import api from '../../../services/api';

export default function ReservationStatusBadge({
    classStatus,
    reservation,      // 예약 객체 (null일 수 있음)
    role,          // 'instructor' 또는 'student'
    classId,       // 현재 수업 ID (액션에 필요할 수 있음)
    studentId,     // 피드백 대상 학생 ID (액션에 필요할 수 있음, 강사 역할 시)
    refreshMyClasses,
}) {

    const [anchorEl, setAnchorEl] = useState(null);
    const [currentMenuItems, setCurrentMenuItems] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

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

    // 학생 예약
    const handleReserve = async (classId) => {
        handleApiAction(
            () => api.post('/api/class-reservations', { class_id: classId }),
            '예약 신청이 완료되었습니다.', // 성공 메시지는 선택적
            '예약 실패',
            classId // 로딩 상태 ID로 classId 사용 가능
        );
    };

    // 학생 즉시 취소
    const handleCancelImmediate = async (reservationId) => {
        handleApiAction(
            () => api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'cancel' }),
            '예약이 취소되었습니다.',
            '취소 실패',
            reservationId
        );
    };
    // 학생 취소 요청
    const handleCancelRequest = async (reservationId) => {
        handleApiAction(
            () => api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'cancel-request' }),
            '취소 요청이 전달되었습니다.',
            '취소 요청 실패',
            reservationId
        );
    };

    // 강사 승인/거절/취소 처리
    const handleApprove = async (reservationId) => {
        handleApiAction(
            () => api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'approve' }),
            '예약을 승인했습니다.',
            '승인 실패',
            reservationId
        );
    };
    const handleReject = async (reservationId) => {
        handleApiAction(
            () => api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'reject' }),
            '예약을 거절했습니다.',
            '거절 실패',
            reservationId
        );
    };

    const handleCancelApprove = async (reservationId) => {
        handleApiAction(
            () => api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'cancel_approve' }),
            '취소 요청을 승인했습니다.',
            '취소 승인 실패',
            reservationId
        );
    };
    const handleCancelDeny = async (reservationId) => {
        handleApiAction(
            () => api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'cancel_deny' }),
            '취소 요청을 거절했습니다.',
            '취소 거절 실패',
            reservationId
        );
    };

    // 상태별 텍스트, 스타일, 액션 결정 로직
    let badgeText = '';
    let badgeStyle = 'default'; // CSS 클래스용
    let actionSymbol = null; // 아이콘 대신 사용할 간단한 기호 또는 텍스트⚙️👁️▶️
    let actionHandler = null;

    // class status
    // reserved_open: { text: '예약가능', status: 'action-waiting', symbol: '', handler: null },
    // reserved_closed: { text: '예약마감', status: 'action-waiting', symbol: '', handler: null },
    // in_progress: { text: '진행중', status: 'action-waiting', symbol: '', handler: null },
    // awaiting_feedback: { text: '피드백예정', status: 'action-need', symbol: '', handler: null },
    // completed: { text: '완료', status: 'complete', symbol: '', handler: null },

    // reservation status
    // applied: { text: '신청중', status: 'action-need', symbol: '', handler: null },
    // approved: { text: '예약완료', status: 'complete', symbol: '', handler: null },
    // rejected: { text: '예약거부', status: 'cancel', symbol: '', handler: null },
    // cancel_request: { text: '취소요청', status: 'action-need', symbol: '', handler: null },
    // cancelled: { text: '예약취소', status: 'cancel', symbol: '', handler: null },
    

    // 수업신청로직

    // 오픈
    // 신청 및 요청자가 신청취소 가능(즉시 취소)
    // 신청 시 강사가 승인/거절 가능
    // 승인 후 학생은 취소신청 불가능 => 강사에게 직접 취소 요청해야함

    // 마감 후~수업시작 전
    // 신청은 불가능
    // 신청상태에서 요청자가 취소요청 가능(승인 후 취소)
    // 강사가 취소에 대한 승인 및 거절

    if (!reservation) { //학생만 보임
        if (classStatus === 'reserved_open' && role === 'student') {
            badgeText = '예약하기';
            badgeStyle = 'action-need';
            actionSymbol = '+';
            actionHandler = () => handleReserve(classId);
        } else {
            return;
        }
    }
    else if (reservation && reservation.status === 'applied') {
        if (classStatus !== 'reserved_open' && classStatus !== 'reserved_closed') return;
        badgeText = '신청완료';
        if (role === 'student') {
            badgeStyle = 'action-waiting';
            actionSymbol = '+'
            actionHandler = (event) => {
                event.stopPropagation();
                let itemsConfig = [];
                itemsConfig.push({ label: '신청취소', action: () => handleCancelImmediate(reservation.id) });
                openMenu(event, itemsConfig);
            };
        } else {
            badgeStyle = 'action-need';
            actionSymbol = '+';
            actionHandler = (event) => {
                event.stopPropagation();
                let itemsConfig = [];
                itemsConfig.push({ label: '승인', action: () => handleApprove(reservation.id) });
                itemsConfig.push({ label: '거절', action: () => handleReject(reservation.id) });
                openMenu(event, itemsConfig);
            };
        }
    }
    else if (reservation && reservation.status === 'approved') {    //강사가 취소가능함
        if (classStatus !== 'reserved_open' && classStatus !== 'reserved_closed') return;
        badgeText = '예약완료';
        badgeStyle = 'action-waiting';
        actionSymbol = '';
        if (role === 'student' && classStatus === 'reserved_closed') {
            actionHandler = (event) => {
                event.stopPropagation();
                let itemsConfig = [];
                itemsConfig.push({ label: '예약취소 요청', action: () => handleCancelRequest(reservation.id) });
                openMenu(event, itemsConfig);
            };
        } else {
            actionSymbol = '+';
            actionHandler = (event) => {
                event.stopPropagation();
                let itemsConfig = [];
                itemsConfig.push({ label: '예약취소', action: () => handleCancelImmediate(reservation.id) });
                openMenu(event, itemsConfig);
            };
        }
    }
    else if (reservation && reservation.status === 'rejected') {
        badgeText = '예약거절';
        badgeStyle = 'cancel';
        actionSymbol = '';
        actionHandler = () => { };
        if (classStatus === 'reserved_open' && role === 'student') {
            badgeStyle = 'action-need';
            actionSymbol = '+';
            actionHandler = (event) => {
                event.stopPropagation();
                let itemsConfig = [];
                itemsConfig.push({ label: '재신청', action: () => handleReserve(classId) });
                openMenu(event, itemsConfig);
            };
        }
        if (classStatus !== 'reserved_open' && classStatus !== 'reserved_closed') {
            badgeStyle = 'cancel';
            actionSymbol = '';
            actionHandler = () => { };
        }
    }
    else if (reservation && reservation.status === 'cancel_request') {
        //수업 시작되면 approved로 변경됨
        if (classStatus !== 'reserved_open' && classStatus !== 'reserved_closed') return;
        badgeText = '예약 취소 신청중';
        if (role === 'student') {
            badgeStyle = 'action-waiting';
            actionSymbol = ''
            actionHandler = () => { };
        } else {
            badgeStyle = 'action-need';
            actionSymbol = '+'
            actionHandler = (event) => {
                event.stopPropagation();
                let itemsConfig = [];
                itemsConfig.push({ label: '취소승인', action: () => handleCancelApprove(reservation.id) });
                itemsConfig.push({ label: '취소거절', action: () => handleCancelDeny(reservation.id) });
                openMenu(event, itemsConfig);
            };
        }
    }
    else if (reservation && reservation.status === 'cancelled') {
        badgeText = '예약취소';
        badgeStyle = 'cancel';
        actionSymbol = '';
        actionHandler = () => { };
        if (role === 'student' && classStatus === 'reserved_open') {    //학생은 신청가능
            actionSymbol = '+';
            actionHandler = (event) => {
                event.stopPropagation();
                let itemsConfig = [];
                itemsConfig.push({ label: '재신청', action: () => handleReserve(classId) });
                openMenu(event, itemsConfig);
            };
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