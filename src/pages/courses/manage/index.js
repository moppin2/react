import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function CourseManage() {
  const navigate = useNavigate();
  
  const handleCreateCourse = async () => {
    navigate('/course/create');
  };

  const { user } = useAuth()

  return (
    <div className='courseManage'>
        <button onClick={handleCreateCourse}>과정생성</button>
        <div>{user.username}강사님 과정 리스트</div>
    </div>
  );
}

export default CourseManage;