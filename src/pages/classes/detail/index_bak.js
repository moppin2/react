
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api'; // 실제 API 서비스 경로로 수정

import UserBadge from '../../../components/common/UserBadge';
import StatusBadge from '../../../components/common/StatusBadge';
import FeedbackStatusBadge from '../components/FeedbackStatusBadge'; // 이전 ClassList.js와 경로 동일 가정
import ReviewStatusBadge from '../components/ReviewStatusBadge';   // 이전 ClassList.js와 경로 동일 가정
import ReservationStatusBadge from '../components/ReservationStatusBadge'; // 이전 ClassList.js와 경로 동일 가정
import '../components/ClassList.css'; // 기존 ClassList.css 재활용 또는 새 CSS 파일

// 상태 레이블은 동일하게 사용
const STATUS_LABEL = {
    reserved_open: { text: '수업전:예약가능', status: 'action-waiting' },
    reserved_closed: { text: '수업전:예약마감', status: 'action-waiting' },
    in_progress: { text: '수업진행중', status: 'action-waiting' },
    completed: { text: '수업종료', status: 'complete' },
    applied: { text: '신청중', status: 'action-need' },
    approved: { text: '예약완료', status: 'complete' },
    rejected: { text: '예약거부', status: 'cancel' },
    cancel_request: { text: '취소요청', status: 'action-need' },
    cancelled: { text: '예약취소', status: 'cancel' },
};

export default function ClassDetailForInstructorPage() {
    const { classId } = useParams(); // URL에서 classId 가져오기
    const [classDetail, setClassDetail] = useState(null); // 단일 수업 데이터
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadClassDetail = useCallback(async () => {
        if (!classId) {
            setError("수업 ID가 없습니다.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // 강사용 단일 수업 상세 정보 API 호출
            const response = await api.get(`/api/myclasses/${classId}`);
            setClassDetail(response.data[0]);
            console.log(response.data[0]);
        } catch (err) {
            console.error("수업 상세 정보 조회 실패:", err);
            setError(err.response?.data?.message || "수업 정보를 가져오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        loadClassDetail();
    }, [loadClassDetail]);

    if (isLoading) return <div className="loading-message">Loading...</div>;
    if (error) return <div className="error-message">오류: {error}</div>;
    if (!classDetail) return <p className="info-message">수업 정보를 찾을 수 없습니다.</p>;

    // classDetail에서 필요한 정보 추출 (API 응답 구조에 따름)
    const cls = classDetail; // 가독성을 위해 cls 변수 사용 (getMyClassList 응답 형식과 맞춤)

    return (
        <div className="class-detail-page-instructor class-list"> {/* class-list 클래스 재활용 */}
            <div className="class-card"> {/* 하나의 카드 형태로 전체 정보 표시 */}
                <header className="class-detail-header">
                    <h1>{cls.title}</h1>
                    <StatusBadge
                        status={STATUS_LABEL[cls.status]?.status || 'default'}
                        badgeText={STATUS_LABEL[cls.status]?.text || cls.status}
                    />
                </header>

                <section className="class-basic-info">
                    <h3>수업 기본 정보</h3>
                    <div className="info-item instructor-info">
                        <strong>강사:</strong>
                        <UserBadge user={cls.instructor} avatarUrl={cls.instructor?.avatarUrl} showUserType={false} />
                    </div>
                    <p className="info-item"><strong>라이선스:</strong> {cls.license_association} - {cls.license_name}</p>
                    <p className="info-item"><strong>과정명:</strong> <Link to={`/course/detail/${cls.course_id}`}>{cls.course_title}</Link></p>
                    <p className="info-item"><strong>수업 시간:</strong> {new Date(cls.start_datetime).toLocaleString('ko-KR')} ~ {new Date(cls.end_datetime).toLocaleString('ko-KR')}</p>
                    {cls.location && <p className="info-item"><strong>장소:</strong> {cls.location}</p>}
                    <p className="info-item">
                        <strong>정원:</strong>
                        <span className="highlight"> {cls.reserved_count || 0}</span> / {cls.capacity}명
                    </p>
                    {cls.description && <div className="info-item description-section"><strong>수업 설명:</strong><div dangerouslySetInnerHTML={{ __html: cls.description.replace(/\n/g, '<br />') }} /></div>}
                </section>

                <section className="instructor-student-list">
                    <h3>참여 학생 목록 및 관리</h3>
                    {cls.reservations && cls.reservations.length > 0 ? (
                        cls.reservations.map((r) => (
                            r.user && // 학생 정보가 있는 경우
                            <div key={r.id} className="student-action">
                                <UserBadge user={r.user} avatarUrl={r.user.avatarUrl} showUserType={false} />
                                <ReservationStatusBadge
                                    classStatus={cls.status} // 수업 전체 상태
                                    classId={cls.id}
                                    reservation={r}          // 해당 학생의 예약 정보
                                    role="instructor"        // 강사 역할
                                />
                                {cls.status === 'completed' && r.status === 'approved' && (
                                    <FeedbackStatusBadge
                                        feedback={r.feedback}
                                        role="instructor"
                                        classId={cls.id}
                                        studentId={r.user.id}
                                    />
                                )}
                                {cls.status === 'completed' && r.status === 'approved' && (
                                    <ReviewStatusBadge // 학생이 작성한 리뷰 상태 표시 (강사 뷰)
                                        review={r.review}
                                        role="instructor" // 강사 입장에서 보는 것
                                        classId={cls.id}
                                        studentId={r.user.id} // 리뷰 작성자 ID (학생)
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="info-message">아직 예약한 학생이 없습니다.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

