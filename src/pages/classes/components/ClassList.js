import './ClassList.css';
import UserBadge from '../../../components/common/UserBadge';
import StatusBadge from '../../../components/common/StatusBadge';
import { useAuth } from '../../../hooks/useAuth';
import FeedbackStatusBadge from './FeedbackStatusBadge';
import ReviewStatusBadge from './ReviewStatusBadge';
import ReservationStatusBadge from './ReservationStatusBadge';

// 상태 키와 화면에 보여줄 레이블 매핑
const STATUS_LABEL = {
    // class status
    reserved_open: { text: '수업전:예약가능', status: 'action-waiting', symbol: '', handler: null },
    reserved_closed: { text: '수업전:예약마감', status: 'action-waiting', symbol: '', handler: null },
    in_progress: { text: '수업진행중', status: 'action-waiting', symbol: '', handler: null },
    completed: { text: '수업종료', status: 'complete', symbol: '', handler: null },
};

export default function ClassList({ classes = [], refreshMyClasses }) {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) return <div>Loading...</div>;
    if (!Array.isArray(classes) || classes.length === 0) {
        return <p>표시할 과정이 없습니다.</p>;
    }

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
                    {/* 수업완료 & 예약승인 상태면 뱃지 숨김 */}
                    {user?.userType === 'user' && !(cls.status === 'completed' && cls.myReservation?.status && cls.myReservation.status === 'approved') && (
                        <ReservationStatusBadge
                            classStatus={cls.status}
                            reservation={cls.myReservation}
                            role="student"
                            classId={cls.id}
                            studentId={user.id}
                            refreshMyClasses={refreshMyClasses}
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
                                    {/* 강사 버튼 로직 */}
                                    {/* {cls.status === 'reserved_open' && r.status === 'applied' && (
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
                                    )} */}

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
                                                    review={r.review}
                                                    role="instructor"
                                                    classId={cls.id}
                                                    studentId={user.id}
                                                />
                                            </>
                                        ) : ( // 학생 뱃지 옆 예약 상태 뱃지 
                                            <ReservationStatusBadge
                                                classStatus={cls.status}
                                                reservation={r}
                                                role="instructor"
                                                classId={cls.id}
                                                studentId={user.id}
                                                refreshMyClasses={refreshMyClasses}
                                            />
                                        )
                                    }

                                </div>
                            ))
                        ) : (
                            <>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}