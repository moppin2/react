import React, { useState, useParams, useEffect } from 'react';
import CourseForm from '../components/CourseForm';
import api from '../../../services/api';

function CourseEdit() {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    (async () => {
      const courseRes = await api.get(`/course/${id}`);
      const criteriaRes = await api.get(`/course/${id}/completion-criteria`);
      setCourseData({
        title: courseRes.data.title,
        description: courseRes.data.description,
        criteriaList: criteriaRes.data,
      });
    })();
  }, [id]);

  const handleSubmit = async ({ title, description, criteriaList }) => {
    await api.put(`/courses/${id}`, { title, description });
    await api.put(`/courses/${id}/completion-criteria`, criteriaList); // 커스텀 API
  };

  if (!courseData) return <div>로딩 중...</div>;

  return <CourseForm initialValues={courseData} onSubmit={handleSubmit} />;
}

export default CourseEdit;
