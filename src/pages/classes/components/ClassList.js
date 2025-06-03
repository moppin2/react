import React, { useState, useEffect, useCallback } from 'react';
import './ClassList.css'; // 여기에 .class-title { cursor: pointer; } 및 .toggle-icon 스타일 추가 권장
import UserBadge from '../../../components/common/UserBadge';
import StatusBadge from '../../../components/common/StatusBadge';
import { useAuth } from '../../../hooks/useAuth';
import FeedbackStatusBadge from './FeedbackStatusBadge';
import ReviewStatusBadge from './ReviewStatusBadge';
import ReservationStatusBadge from './ReservationStatusBadge';
import { useNavigate } from 'react-router-dom';

// 상태 키와 화면에 보여줄 레이블 매핑
const STATUS_LABEL = {
    // class status
    reserved_open: { text: '수업전:예약가능', status: 'action-waiting', symbol: '', handler: null },
    reserved_closed: { text: '수업전:예약마감', status: 'action-waiting', symbol: '', handler: null },
    in_progress: { text: '수업진행중', status: 'action-waiting', symbol: '', handler: null },
    completed: { text: '수업종료', status: 'complete', symbol: '', handler: null },
};

export default function ClassList({ classes = [], refreshMyClasses, showDetail = false }) {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate(); // 상세 페이지 이동이 필요하다면 다른 방식으로 호출

    // 각 클래스의 상세 정보 확장 여부를 관리하는 상태
    // { classId1: true, classId2: false, ... }
    const [expandedClasses, setExpandedClasses] = useState({});

    // showDetail prop이나 classes 목록이 변경되면 expandedClasses 상태를 초기화/업데이트합니다.
    useEffect(() => {
        const newExpandedState = {};
        if (Array.isArray(classes)) {
            classes.forEach(cls => {
                newExpandedState[cls.id] = !!showDetail; // showDetail prop에 따라 초기 확장 상태 설정
            });
        }
        setExpandedClasses(newExpandedState);
    }, [classes, showDetail]);

    const handleTitleClick = (classId) => {
        setExpandedClasses(prevState => ({
            ...prevState,
            [classId]: !prevState[classId] // 현재 상태의 반대로 토글
        }));
    };

    if (authLoading) return <div>Loading...</div>;
    if (!Array.isArray(classes) || classes.length === 0) {
        return <p>표시할 과정이 없습니다.</p>;
    }

    return (
        <div className="class-list">
            {classes.map((cls) => (
                <div key={cls.id} className="class-card">

                    {/* 클래스 헤더정보 */}
                    <div className="class-header">
                        <span className="highlight">{cls.reserved_count || 0}</span>
                        <span>/{cls.capacity}&nbsp;&nbsp;</span>
                        {STATUS_LABEL[cls.status] ? (
                            <StatusBadge
                                status={STATUS_LABEL[cls.status]['status']}
                                badgeText={STATUS_LABEL[cls.status]['text']}
                                actionSymbol={STATUS_LABEL[cls.status]['symbol']}
                                actionHandler={STATUS_LABEL[cls.status]['handler']}
                            />
                        ) : (
                            <StatusBadge status="default" badgeText={cls.status || '알 수 없음'} />
                        )}


                        {/* 학생전용 */}
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
                        {user?.userType === 'user' && cls.status === 'completed' && ( // 리뷰는 수강 확정 아니어도 가능할 수 있음 (조건 확인 필요)
                            <ReviewStatusBadge
                                review={cls.review}
                                role="student"
                                classId={cls.id}
                                studentId={user.id} // 학생 본인의 리뷰만 해당
                            />)}
                    </div>

                    {/* 수업 일시 */}
                    <p className="class-datetime">
                        {new Date(cls.start_datetime).toLocaleString('ko-KR', {
                            weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </p>

                    {/* class-title 클릭 시 상세 정보 토글 */}
                    <h3 className="class-title" onClick={() => handleTitleClick(cls.id)}>
                        <span className="toggle-icon" aria-hidden="true">
                            {expandedClasses[cls.id] ? '-' : '+'}
                        </span>
                        {cls.title}
                    </h3>

                    {/* Detail: expandedClasses 상태에 따라 표시 */}
                    {expandedClasses[cls.id] && (
                        <div className="class-detail">
                            <h4>장소</h4>
                            <p >{cls.location}</p>
                            <h4>수업설명</h4>
                            <p className="class-description">{cls.description}</p>
                            {cls.materials && (
                                <>
                                    <h4>준비물</h4>
                                    <p className="class-materials">{cls.materials}</p>
                                </>
                            )}
                            {cls.additional_fees && (
                                <>
                                    <h4>추가요금 안내</h4>
                                    <p className="additional-charge">{cls.additional_fees}</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* 강습정보 */}
                    <div className="course-info">
                        <div className="course-info-top">
                            <UserBadge
                                user={cls.instructor} // API 응답에 instructor 객체가 있다고 가정
                                avatarUrl={cls.instructor?.avatarUrl}
                                showUserType={false}
                            />
                            <span className="association">{cls.license_association}</span>
                            <span className="license">{cls.license_name}</span>
                        </div>
                        <div className="course-title">{cls.course_title}</div>
                    </div>

                    {/* 하단 액션 및 학생 뱃지 리스트 */}
                    <div className="class-actions">
                        {user?.userType === 'instructor' ? (
                            Array.isArray(cls.reservations) && cls.reservations.map((r) => ( // cls.reservations가 배열인지 확인
                                <div key={r.id} className="student-action">
                                    <UserBadge user={r.user} avatarUrl={r.user?.avatarUrl} showUserType={false} />
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
                                                    studentId={r.user.id} // 강사가 보는 학생의 리뷰
                                                />
                                            </>
                                        ) : (
                                            <ReservationStatusBadge
                                                classStatus={cls.status}
                                                reservation={r}
                                                role="instructor"
                                                classId={cls.id}
                                                studentId={r.user.id} // 해당 학생 ID
                                                refreshMyClasses={refreshMyClasses}
                                            />
                                        )
                                    }
                                </div>
                            ))
                        ) : (
                            <>
                                {/* 학생 뷰에서는 이 영역에 다른 내용이 필요하다면 추가 */}
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
