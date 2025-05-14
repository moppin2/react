import { Link } from 'react-router-dom';
import './CourseList.css';

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
                        <h3 className="course-title">
                            <Link to={`/course/${course.id}`}>{course.title}</Link>
                        </h3>
                        <div className="course-meta">
                            <span>강사 : {course.instructor_name}</span>
                        </div>
                        <div className="course-meta">
                            <span>과정 : {course.license_association} - {course.license_name}</span>
                        </div>
                        <div className="course-meta">
                            <span>난이도 : {course.level_name}</span>
                        </div>
                        <div className="course-meta">
                            <span>지역 : {course.region_name}</span>
                        </div>
                    </div>

                    {type === 'instructor' && (
                        <div className="course-actions">
                            <button>채팅</button>&nbsp;
                            <button>수업관리</button>&nbsp;
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