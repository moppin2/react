import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ClassSection from '../components/ClassSection';
import api from '../../../services/api';

function ClassManage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myClasses, setMyClasses] = useState([]);

  useEffect(() => {
    if (user?.id) {
      api.get(`/api/classes?instructor_id=${user.id}`)
        .then(res => setMyClasses(res.data))
        .catch(err => console.error('수업 목록 조회 실패', err));
    }
  }, [user.id]);

  const handleCreateClass = () => {
    navigate('/class/create');
  };

  return (
    <div className='class-manage'>
      <div className="function-area">
        <button onClick={handleCreateClass}>수업생성</button>
      </div>
      {<ClassSection
        title={`${user.username} 강사님 수업 리스트`}
        classes={myClasses}
        type="instructor"
      />}
    </div>
  );
}

export default ClassManage;