import './ClassList.css';
import UserBadge from '../../../components/common/UserBadge';


// 상태 키와 화면에 보여줄 레이블 매핑
const STATUS_LABEL = {
    reserved_open: '예약 가능',
    reserved_closed: '예약 마감',
    in_progress: '진행 중',
    awaiting_feedback: '피드백 예정',
    completed: '완료',
};

export default function ClassList({ classes = [], type = 'default' }) {
    if (!Array.isArray(classes) || classes.length === 0) {
        return <p>표시할 과정이 없습니다.</p>;
    }

    return (
        <div className="class-list">
            {classes.map((cls) => (
                <div key={cls.id} className="class-card">
                    <div className="class-status">
                        <span className={`status-badge status-${cls.status}`}>
                            {STATUS_LABEL[cls.status]}
                        </span>
                        <span className="highlight">{cls.reserved_count || 0}</span> / {cls.capacity}
                    </div>
                    <p className="class-datetime">
                        {new Date(cls.start_datetime).toLocaleString('ko-KR', {
                            weekday: 'short',   // 요일 (일, 월, ..)
                            year: 'numeric', // 연도
                            month: '2-digit', // 월 (2자리)
                            day: '2-digit', // 일 (2자리)
                            hour: '2-digit', // 시 (2자리)
                            minute: '2-digit'  // 분 (2자리)
                        })}

                    </p>
                    <h3 className="class-title">{cls.title}</h3>
                    <div className="course-info">
                        <div className="course-info-top">
                            <UserBadge
                                user={cls.instructor}
                                avatarUrl={cls.instructor_avatar_url}
                                showUserType={false}
                            />
                            <span className="association">{cls.license_association}</span>
                            <span className="license">{cls.license_name}</span>
                        </div>
                        <div className="class-meta course-title">{cls.course_title}</div>
                    </div>
                    {/* {type === 'instructor' && (
                        <div className="course-actions">강사전용 기능
                        </div>
                    )} */}
                </div>
            ))}
        </div>
    );
}

