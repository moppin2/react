import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import './CourseDetail.css'

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    api.get(`/api/course/${id}`)
      .then(res => setCourse(res.data))
      .catch(err => console.error('과정 상세 조회 실패', err));
  }, [id]);

  if (!course) return <p>로딩 중...</p>;

  return (
    <div className="course-detail">
      <h1 className="course-title">{course.title}</h1>
      <p className="course-subinfo">
        {course.license_association} - {course.license_name} / {course.level_name} / {course.region_name}
      </p>
      <p className="course-subinfo">강사: {course.instructor_name}</p>

      {course.coverImageUrl && (
        <div className="course-thumbnail">
          <img src={course.coverImageUrl} alt="썸네일" />
        </div>
      )}

      <div className="course-section">
        <h3>과정 설명</h3>
        <p>{course.description}</p>
      </div>

      <div className="course-section">
        <h3>커리큘럼</h3>
        <p>{course.curriculum}</p>
      </div>

      <div className="course-section">
        <h3>수료 기준</h3>
        <ul className="course-criteria">
          {course.criteriaList.map((c, idx) => (
            <li key={idx}>{c.type}: {c.value}</li>
          ))}
        </ul>
      </div>

      {course.galleryImages?.length > 0 && (
        <div className="course-section">
          <h3>갤러리</h3>
          <div className="course-carousel">
            {course.galleryImages.map((img, idx) => (
              <img key={idx} src={img.url} alt={`gallery-${idx}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
