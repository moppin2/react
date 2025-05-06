import React, { useState } from 'react';
import CourseForm from '../component/CourseForm'; 
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api'; // axios 인스턴스
import { useAuth } from '../../../hooks/useAuth';

function CourseCreatePage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // 로그인한 instructor 정보

  const handleCreateCourse = async (formData) => {
    console.log('handleCreateCourse');
    try {
      setLoading(true);
      const payload = {
        ...formData,
        instructor_id: user.id, // 로그인 강사 ID 포함
      };
      await api.post('api/courses', payload);

      alert('과정이 성공적으로 생성되었습니다.');
      navigate('/courses'); // 목록 페이지로 이동 (경로는 상황에 따라 변경 가능)
    } catch (err) {
      console.error('과정 생성 실패:', err);
      alert('과정 생성에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>과정 생성</h1>
      <CourseForm onSubmit={handleCreateCourse} loading={loading} />
    </div>
  );
}

export default CourseCreatePage;
