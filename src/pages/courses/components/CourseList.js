import { Link } from 'react-router-dom';
import './CourseList.css';
import UserBadge from '../../../components/common/UserBadge';

export default function CourseList({ courses = [], type = 'default' }) {
    if (!Array.isArray(courses) || courses.length === 0) {
        return <p>표시할 과정이 없습니다.</p>;
    }

    return (
        <div className="course-list">
            {courses.map((course) => (
                <div key={course.id} className="course-card">
                    {course.thumbnail_url && (
                        <div className="course-thumbnail">
                            <img src={course.thumbnail_url} alt="썸네일" />
                        </div>
                    )}

                    <div className="course-info">
                        <div className="course-meta">
                            <span className="association">{course.license_association}</span>
                            <span className="license">{course.license_name}</span>
                            <span className="level">{course.level_name}</span>
                            <span className="region">{course.region_name}</span>
                        </div>
                        <h6 className="course-title">
                            <Link to={`/course/${course.id}`}>
                                {course.title}
                            </Link>
                            {!course.is_published && (
                                <span className="badge-private">
                                    비공개
                                </span>
                            )}
                        </h6>
                        <div className="course-meta">
                            <UserBadge
                                user={course.instructor}
                                avatarUrl={course.instructor_avatar_url}
                                showUserType={false}
                            />
                        </div>
                        <div className="course-meta">
                        </div>
                    </div>

                    {type === 'instructor' && (
                        <div className="course-actions">
                            {course.applied_count > 0 && (
                                <Link to={`/course/enrollment/approve/${course.id}`}>
                                    <button>
                                        등록요청
                                        <span className="badge">{course.applied_count}</span>
                                    </button>
                                </Link>
                            )}

                            <button>
                                수강생
                                {course.approved_count > 0 && (
                                    <span className="badge">{course.approved_count}</span>
                                )}
                            </button>

                            <Link to={`/course/edit/${course.id}`}>
                                <button>수정</button>
                            </Link>
                        </div>
                    )}
                </div>
            ))}
        </div>

    );
}