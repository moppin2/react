import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import CourseSection from '../components/CourseSection';
import api from '../../../services/api';

function CourseManage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    if (user?.id) {
      api.get(`/api/courses?instructor_id=${user.id}`)
        .then(res => setMyCourses(res.data))
        .catch(err => console.error('과정 목록 조회 실패', err));
    }
  }, [user.id]);

  const handleCreateCourse = () => {
    navigate('/course/create');
  };

  return (
    <div className='courseManage'>
      <button onClick={handleCreateCourse}>과정생성</button>
      {<CourseSection
        title={`${user.username} 강사님 과정 리스트`}
        courses={myCourses}
        type="instructor"
      />}
    </div>
  );
}

export default CourseManage;