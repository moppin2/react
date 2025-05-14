import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseForm from '../components/CourseForm';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

function CourseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);

  // course 정보 로딩
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/api/course/${id}`);
        setInitialValues(res.data);

        if (res.data?.instructor_id && user.id !== res.data.instructor_id) {
          alert('권한이 없습니다.');
          navigate('/course/manage');
          return;
        }
      } catch (err) {
        console.error('과정 정보 조회 실패:', err);
        alert('해당 과정을 불러올 수 없습니다.');
        navigate('/course/manage');
      }
    })();
  }, [id, navigate, user.id]);

  const handleUpdateCourse = async (formData) => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        id,
        instructor_id: user.id, // 안전하게 서버에서도 검증함
      };
      await api.post('/api/course', payload);
      alert('과정이 성공적으로 수정되었습니다.');
      navigate('/course/manage');
    } catch (err) {
      console.error('과정 수정 실패:', err);
      alert('과정 수정에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ padding: '2rem' }}>
      <h1>과정 수정</h1>
      {initialValues ? (
        <CourseForm
          initialValues={initialValues}
          onSubmit={handleUpdateCourse}
          loading={loading}
        />
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
}

export default CourseEdit;
