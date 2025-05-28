import './ClassList.css';
import UserBadge from '../../../components/common/UserBadge';
import StatusBadge from '../../../components/common/StatusBadge';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import { useState } from 'react';
import FeedbackStatusBadge from './FeedbackStatusBadge';
import ReviewStatusBadge from './ReviewStatusBadge';

// 상태 키와 화면에 보여줄 레이블 매핑
const STATUS_LABEL = {
    // class status
    reserved_open: { text: '예약가능', status: 'action-waiting', symbol: '', handler: null },
    reserved_closed: { text: '예약마감', status: 'action-waiting', symbol: '', handler: null },
    in_progress: { text: '진행중', status: 'action-waiting', symbol: '', handler: null },
    awaiting_feedback: { text: '피드백예정', status: 'action-need', symbol: '', handler: null },
    completed: { text: '완료', status: 'complete', symbol: '', handler: null },

    // reservation status
    applied: { text: '신청중', status: 'action-need', symbol: '', handler: null },
    approved: { text: '예약완료', status: 'complete', symbol: '', handler: null },
    rejected: { text: '예약거부', status: 'cancel', symbol: '', handler: null },
    cancel_request: { text: '취소요청', status: 'action-need', symbol: '', handler: null },
    cancelled: { text: '예약취소', status: 'cancel', symbol: '', handler: null },
};

export default function ClassList({ classes = [], refreshMyClasses }) {
    const { user, loading: authLoading } = useAuth();
    const [actionLoading, setActionLoading] = useState(null);

    if (authLoading) return <div>Loading...</div>;
    if (actionLoading) return <div>Loading...</div>;
    if (!Array.isArray(classes) || classes.length === 0) {
        return <p>표시할 과정이 없습니다.</p>;
    }

    const handleApiAction = async (apiCall, successMessage, failureMessage, reservationIdForLoading = null) => {
        if (reservationIdForLoading) setActionLoading(reservationIdForLoading);
        else setActionLoading(true); // 일반 액션 로딩
        try {
            await apiCall();
            if (successMessage) alert(successMessage);
            await refreshMyClasses(); // <<--- 데이터 리프레시
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

    return (
        <div className="class-list">
            {classes.map((cls) => (
                <div key={cls.id} className="class-card">

                    {/* 정원 */}
                    <span className="highlight">{cls.reserved_count || 0}</span>
                    <span>/{cls.capacity}&nbsp;&nbsp;</span>
                    {/* 상단 상태 및 카운트, 학생 예약 상태 뱃지 */}
                    <StatusBadge
                        status={STATUS_LABEL[cls.status]['status']}
                        badgeText={STATUS_LABEL[cls.status]['text']}
                        actionSymbol={STATUS_LABEL[cls.status]['symbol']}
                        actionHandler={STATUS_LABEL[cls.status]['handler']}
                    />
                    {/* 학생 모드: 내 예약 상태 뱃지 */}
                    {user?.userType === 'user' && cls.status === 'completed' && cls.myReservation?.status && cls.myReservation.status !== 'approved' && (
                        <StatusBadge
                            status={STATUS_LABEL[cls.myReservation.status]['status']}
                            badgeText={STATUS_LABEL[cls.myReservation.status]['text']}
                            actionSymbol={STATUS_LABEL[cls.myReservation.status]['symbol']}
                            actionHandler={STATUS_LABEL[cls.myReservation.status]['handler']}
                            title={'(클릭하여 액션 보기)'}
                        />
                    )}

                    {user?.userType === 'user' && cls.status === 'completed' && cls.myReservation?.status && cls.myReservation.status === 'approved' && (
                        <FeedbackStatusBadge
                            feedback={cls.feedback}
                            role="student"
                            classId={cls.id}
                            studentId={user.id}
                            refreshMyClasses={refreshMyClasses}
                        />)}
                    {user?.userType === 'user' && cls.status === 'completed' && (
                        <ReviewStatusBadge
                            review={cls.review}
                            role="student"
                            classId={cls.id}
                            studentId={user.id}
                        />)}

                    {/* 수업 일시 */}
                    <p className="class-datetime">
                        {new Date(cls.start_datetime).toLocaleString('ko-KR', {
                            weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </p>

                    <h3 className="class-title">{cls.title}</h3>

                    {/* 강사+라이선스 정보 */}
                    <div className="course-info">
                        <div className="course-info-top">
                            <UserBadge
                                user={cls.instructor}
                                avatarUrl={cls.instructor.avatarUrl}
                                showUserType={false}
                            />
                            <span className="association">{cls.license_association}</span>
                            <span className="license">{cls.license_name}</span>
                        </div>
                        <div className="class-meta course-title">{cls.course_title}</div>
                    </div>

                    {/* 하단 액션 및 학생 뱃지 리스트 */}
                    <div className="class-actions">
                        {user?.userType === 'instructor' ? (
                            cls.reservations.map((r) => (
                                <div key={r.id} className="student-action">
                                    <UserBadge user={r.user} avatarUrl={r.user.avatarUrl} showUserType={false} />
                                    {
                                        r.status === 'approved' && cls.status === 'completed' ? (
                                            <>
                                                <FeedbackStatusBadge
                                                    feedback={r.feedback}
                                                    role="instructor"
                                                    classId={cls.id}
                                                    studentId={r.user.id}
                                                    refreshMyClasses={refreshMyClasses}
                                                />

                                                <ReviewStatusBadge
                                                    review={cls.review}
                                                    role="instructor"
                                                    classId={cls.id}
                                                    studentId={user.id}
                                                />
                                            </>
                                        ) : ( // 학생 뱃지 옆 예약 상태 뱃지 
                                            <StatusBadge
                                                status={STATUS_LABEL[r.status]['status']}
                                                badgeText={STATUS_LABEL[r.status]['text']}
                                                actionSymbol={STATUS_LABEL[r.status]['symbol']}
                                                actionHandler={STATUS_LABEL[r.status]['handler']}
                                            />
                                        )
                                    }

                                    {/* 버튼 로직 */}
                                    {cls.status === 'reserved_open' && r.status === 'applied' && (
                                        <>
                                            <button onClick={() => handleApprove(r.id)}>승인</button>
                                            <button onClick={() => handleReject(r.id)}>거절</button>
                                        </>
                                    )}
                                    {cls.status === 'reserved_open' && r.status === 'approved' && (
                                        <button onClick={() => handleReject(r.id)}>예약취소</button>
                                    )}
                                    {cls.status === 'reserved_closed' && r.status === 'cancel_request' && (
                                        <>
                                            <button onClick={() => handleCancelApprove(r.id)}>취소승인</button>
                                            <button onClick={() => handleCancelDeny(r.id)}>취소거절</button>
                                        </>
                                    )}

                                </div>
                            ))
                        ) : (
                            <>  {/* 학생 모드 버튼 */}
                                {cls.status === 'reserved_open' && (!cls.myReservation || (cls.myReservation && (cls.myReservation.status === 'rejected' || cls.myReservation.status === 'cancelled'))) && (
                                    <button onClick={() => handleReserve(cls.id)}>예약신청</button>
                                )}
                                {cls.status === 'reserved_open' && cls.myReservation?.status === 'applied' && (
                                    <button onClick={() => handleCancelImmediate(cls.myReservation.id)}>예약취소</button>
                                )}
                                {cls.status === 'reserved_closed' && cls.myReservation?.status === 'applied' && (
                                    <button onClick={() => handleCancelRequest(cls.myReservation.id)}>취소신청</button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}