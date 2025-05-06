import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Axios 인스턴스

function CourseForm({ initialValues, onSubmit, loading = false }) {
  const [title, setTitle] = useState('');
  const [associationCode, setAssociationCode] = useState('');
  const [levelCode, setLevelCode] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [curriculum, setCurriculum] = useState('');
  const [description, setDescription] = useState('');
  const [criteriaList, setCriteriaList] = useState([{ type: '', value: '' }]);

  const [associationOptions, setAssociationOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);

  useEffect(() => {
    setTitle(initialValues?.title || '');
    setAssociationCode(initialValues?.association_code || '');
    setLevelCode(initialValues?.level_code || '');
    setRegionCode(initialValues?.region_code || '');
    setCurriculum(initialValues?.curriculum || '');
    setDescription(initialValues?.description || '');
    setCriteriaList(initialValues?.criteriaList || [{ type: '', value: '' }]);
  }, [initialValues]);

  // 코드 옵션 불러오기
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/codes/multiple?groups=ASSOCIATION,LEVEL,REGION');
        setAssociationOptions(res.data.ASSOCIATION);
        setLevelOptions(res.data.LEVEL);
        setRegionOptions(res.data.REGION);
      } catch (err) {
        console.error('코드 불러오기 실패:', err);
      }
    })();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('과정명을 입력하세요.');
    onSubmit({
      title,
      association_code: associationCode,
      level_code: levelCode,
      region_code: regionCode,
      curriculum,
      description,
      criteriaList
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>과정 정보</h2>

      <div>
        <label>과정명</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <label>협회 코드</label>
        <select value={associationCode} onChange={(e) => setAssociationCode(e.target.value)}>
          <option value="">선택하세요</option>
          {associationOptions.map(opt => (
            <option key={opt.code} value={opt.code}>{opt.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>레벨 코드</label>
        <select value={levelCode} onChange={(e) => setLevelCode(e.target.value)}>
          <option value="">선택하세요</option>
          {levelOptions.map(opt => (
            <option key={opt.code} value={opt.code}>{opt.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>지역 코드</label>
        <select value={regionCode} onChange={(e) => setRegionCode(e.target.value)}>
          <option value="">선택하세요</option>
          {regionOptions.map(opt => (
            <option key={opt.code} value={opt.code}>{opt.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>커리큘럼</label>
        <textarea value={curriculum} onChange={(e) => setCurriculum(e.target.value)} rows={3} />
      </div>

      <div>
        <label>설명</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>

      <hr />
      <h3>수료 기준</h3>
      {criteriaList.map((c, index) => (
        <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            placeholder="기준 종류 (예: 출석)"
            value={c.type}
            onChange={(e) => {
              const list = [...criteriaList];
              list[index].type = e.target.value;
              setCriteriaList(list);
            }}
          />
          <input
            placeholder="기준 값 (예: 80%)"
            value={c.value}
            onChange={(e) => {
              const list = [...criteriaList];
              list[index].value = e.target.value;
              setCriteriaList(list);
            }}
          />
          <button type="button" onClick={() => {
            const list = [...criteriaList];
            list.splice(index, 1);
            setCriteriaList(list.length ? list : [{ type: '', value: '' }]);
          }}>삭제</button>
        </div>
      ))}
      <button type="button" onClick={() => setCriteriaList([...criteriaList, { type: '', value: '' }])}>+ 기준 추가</button>

      <hr />
      <button type="submit" disabled={loading}>
        {loading ? '저장 중...' : '저장'
      }</button>
    </form>
  );
}

export default CourseForm;

