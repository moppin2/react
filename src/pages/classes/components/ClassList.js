import './ClassList.css';
import UserBadge from '../../../components/common/UserBadge';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackActionModal from './FeedbackActionModal';

// 상태 키와 화면에 보여줄 레이블 매핑
const STATUS_LABEL = {
    // class status
    reserved_open: '예약가능',
    reserved_closed: '예약마감',
    in_progress: '진행중',
    awaiting_feedback: '피드백예정',
    completed: '완료',

    // reservation status
    applied: '신청중',
    approved: '예약완료',
    rejected: '예약거부',
    cancel_request: '취소요청',
    cancelled: '예약취소',
};

export default function ClassList({ classes = [], refreshMyClasses }) {
    const { user, loading: authLoading } = useAuth();
    const [actionLoading, setActionLoading] = useState(null);
    const [isFeedbackActionModalOpen, setIsFeedbackActionModalOpen] = useState(false);
    const [selectedFeedbackForModal, setSelectedFeedbackForModal] = useState(null);
    const navigate = useNavigate();

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
    // 학생 후기 작성
    const handleWriteReview = (classId) => {
        navigate(`/review/write/${classId}`);
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
    // 강사 피드백 작성
    const handleWriteFeedback = (classId, userId) => {
        navigate(`/class/${classId}/feedback/${userId}`);
    };

    const handleEditFeedback = (feedbackId, classId, studentId) => {
        navigate(`/feedback/edit/${feedbackId}`);
        setIsFeedbackActionModalOpen(false); // 모달 닫기
    };

    const handleRequestPublication = async (feedbackId) => {
        await handleApiAction(
            () => api.put(`/api/class-feedbacks/${feedbackId}/request-publication`),
            '공개 요청을 보냈습니다.',
            '공개 요청 실패',
            `feedback-${feedbackId}` // 로딩 상태를 위한 고유 ID
        );
        closeFeedbackActionModal();
    };

    const handleFinalizeNonPublic = async (feedbackId) => {
        await handleApiAction(
            () => api.put(`/api/class-feedbacks/${feedbackId}/finalize-non-public`),
            '미공개로 확정되었습니다.',
            '미공개 확정 실패',
            `feedback-${feedbackId}`
        );
        closeFeedbackActionModal();
    };


    // 2. 모달을 여는 함수 (피드백 객체를 받아 상태에 저장)
    const openFeedbackActionModal = (feedback) => {
        setSelectedFeedbackForModal(feedback);
        setIsFeedbackActionModalOpen(true);
    };

    // 모달을 닫는 함수
    const closeFeedbackActionModal = () => {
        setIsFeedbackActionModalOpen(false);
        setSelectedFeedbackForModal(null);
    };

    const handleApproveFeedbackPublication = (feedbackId) => {

    }

    const handleRejectFeedbackPublication = (feedbackId) => {

    }

    const handleViewFeedbackDetails = (feedbackId) => {
        console.log(`Viewing details for feedback ID: ${feedbackId}`);
        // 예: navigate(`/instructor/feedback/details/${feedbackId}`);
        // 또는 모달을 띄워 상세 정보 표시
        // setSelectedFeedbackForDetailModal(feedbackId); // 상세 보기용 모달 상태 설정
        // setIsFeedbackDetailModalOpen(true);
    };


    return (
        <div className="class-list">
            {classes.map((cls) => (
                <div key={cls.id} className="class-card">

                    <span className="highlight">{cls.reserved_count || 0}</span>
                    <span>/{cls.capacity}&nbsp;&nbsp;</span>
                    {/* 상단 상태 및 카운트, 학생 예약 상태 뱃지 */}
                    <span className={`status-badge status-${cls.status}`}>
                        {STATUS_LABEL[cls.status]}
                    </span>
                    {/* 학생 모드: 내 예약 상태 뱃지 */}
                    {user?.userType === 'user' && cls.myReservation?.status && (
                        <span className={`status-badge status-${cls.myReservation.status}`}>
                            {STATUS_LABEL[cls.myReservation.status]}
                        </span>
                    )}

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
                                    {/* 학생 뱃지 옆 예약 상태 뱃지 */}
                                    <span className={`status-badge status-${r.status}`}>
                                        {STATUS_LABEL[r.status]}
                                    </span>&nbsp;&nbsp;

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

                                    {cls.status === 'completed' && (
                                        <>
                                            {!r.feedback && r.status === 'approved' && ( // 예약상태는 백엔드에서 보정됨
                                                <button onClick={() => handleWriteFeedback(cls.id, r.user.id)}>피드백</button>
                                            )}

                                            {r.feedback && r.feedback.is_publication_requested === null && ( // Case 2: 피드백이 있고, 임시저장 상태인 경우
                                                <button className="feedback-action" onClick={() => openFeedbackActionModal(r.feedback)}>피드백 Action</button>
                                            )}
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
                                {cls.status === 'in_progress' && null}
                                {cls.status === 'completed' && !cls.review && (
                                    <button onClick={() => handleWriteReview(cls.id)}>후기작성</button>
                                )}

                                {cls.feedback && (
                                    <>
                                        <button onClick={() => handleViewFeedbackDetails(cls.feedback.id)}>피드백 보기</button>

                                        {!cls.feedback.publish_approved && !cls.feedback.publish_rejected && (
                                            <>
                                                <button onClick={() => handleApproveFeedbackPublication(cls.feedback.id)}>피드백 공개</button>
                                                <button onClick={() => handleRejectFeedbackPublication(cls.feedback.id)}>피드백 비공개</button>
                                            </>
                                        )}

                                        {/* 학생이 이미 공개 승인한 경우 */}
                                        {cls.feedback.publish_approved === true && (
                                            <span> (공개 승인됨)</span>
                                        )}
                                        {/* 학생이 공개 거절한 경우 */}
                                        {cls.feedback.publish_rejected === true && (
                                            <span> (공개 거절됨)</span>
                                        )}
                                    </>
                                )}
                            </>
                        )}


                        <div>
                            {/* 4. 모달 컴포넌트 렌더링 (선택된 피드백이 있을 때만) */}
                            {selectedFeedbackForModal && (
                                <FeedbackActionModal
                                    isOpen={isFeedbackActionModalOpen}
                                    onClose={closeFeedbackActionModal}
                                    feedback={selectedFeedbackForModal} // 선택된 피드백 객체 전달
                                    // 모달 내부 버튼에서 사용할 핸들러 함수들 전달
                                    onEdit={() => handleEditFeedback(selectedFeedbackForModal.id, selectedFeedbackForModal.class_id, selectedFeedbackForModal.user_id)}
                                    onRequestPublication={() => handleRequestPublication(selectedFeedbackForModal.id)}
                                    onFinalizeNonPublic={() => handleFinalizeNonPublic(selectedFeedbackForModal.id)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}