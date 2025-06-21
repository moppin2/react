import React, { useState } from 'react';
import ClassForm from '../components/ClassForm'; 
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api'; // axios 인스턴스

function ClassCreatePage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateClass = async (formData) => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
      };

      await api.post('api/class', payload);
      alert('수업이 성공적으로 생성되었습니다.');

      navigate('/class/manage'); // 목록 페이지로 이동 (경로는 상황에 따라 변경 가능)
    } catch (err) {
      console.error('수업 생성 실패:', err);
      alert('수업 생성에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="content-basic">
      {/* <h1>수업 생성</h1> */}
      <ClassForm onSubmit={handleCreateClass} loading={loading} />
    </div>
  );
}

export default ClassCreatePage;
