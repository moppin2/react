import './ClassList.css';
import UserBadge from '../../../components/common/UserBadge';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function ClassList({ classes = [] }) {
    const { user, loading } = useAuth();
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    if (loading) return <div>Loading...</div>;
    if (actionLoading) return <div>Loading...</div>;
    if (!Array.isArray(classes) || classes.length === 0) {
        return <p>표시할 과정이 없습니다.</p>;
    }


    // 학생 예약
    const handleReserve = async (classId) => {
        setActionLoading(classId);
        try {
            await api.post('/api/class-reservations', { class_id: classId });
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || '예약 실패');
        } finally {
            setActionLoading(null);
        }
    };
    // 학생 즉시 취소
    const handleCancelImmediate = async (reservationId) => {
        setActionLoading(reservationId);
        try {
            await api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'cancel' });
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || '취소 실패');
        } finally {
            setActionLoading(null);
        }
    };
    // 학생 취소 요청
    const handleCancelRequest = async (reservationId) => {
        setActionLoading(reservationId);
        try {
            await api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'cancel-request' });
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || '취소 요청 실패');
        } finally {
            setActionLoading(null);
        }
    };
    // 학생 후기 작성
    const handleWriteReview = (classId) => {
        navigate(`/review/write/${classId}`);
    };

    // 강사 승인/거절/취소 처리
    const handleApprove = async (reservationId) => {
        setActionLoading(reservationId);
        try {
            await api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'approve' });
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || '승인 실패');
        } finally { setActionLoading(null); }
    };
    const handleReject = async (reservationId) => {
        setActionLoading(reservationId);
        try {
            await api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'reject' });
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || '거절 실패');
        } finally { setActionLoading(null); }
    };

    const handleCancelApprove = async (reservationId) => {
        setActionLoading(reservationId);
        try {
            await api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'cancel_approve' });
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || '취소 승인 실패');
        } finally { setActionLoading(null); }
    };
    const handleCancelDeny = async (reservationId) => {
        setActionLoading(reservationId);
        try {
            await api.patch(`/api/class-reservations/${reservationId}/status`, { action: 'cancel_deny' });
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || '취소 거절 실패');
        } finally { setActionLoading(null); }
    };
    // 강사 피드백 작성
    const handleWriteFeedback = (classId, userId) => {
        // /class/:classId/feedback/:studentId
        navigate(`/class/${classId}/feedback/${userId}`);
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
                                    <UserBadge user={r.user} avatarUrl={r.user.avatarUrl} showUserType={false}/>
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
                                        <button onClick={() => handleWriteFeedback(cls.id, r.user.id)}>피드백작성</button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <>  {/* 학생 모드 버튼 */}
                                {cls.status === 'reserved_open' && ( !cls.myReservation || ( cls.myReservation && (cls.myReservation.status === 'rejected' || cls.myReservation.status === 'cancelled')) )&& (
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
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}