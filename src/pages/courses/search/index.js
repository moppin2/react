import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import CourseSection from '../components/CourseSection';
import './Search.css';

function CourseSearchPage() {
  const [courses, setCourses] = useState([]);
  const [licenseOptions, setLicenseOptions] = useState([]);
  const [codeOptions, setCodeOptions] = useState({ ASSOCIATION: [], LEVEL: [], REGION: [] });

  const [filters, setFilters] = useState({
    association_code: '',
    license_id: '',
    level_code: '',
    region_code: '',
    course_title: '',
    instructor_name: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    // 협회 변경 시 라이센스 목록 재조회
    if (name === 'association_code') {
      api.get(`/api/licenses?association=${value}`)
        .then(res => setLicenseOptions(res.data))
        .catch(err => {
          console.error('라이센스 불러오기 실패:', err);
          setLicenseOptions([]);
        });
    }
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/api/courses?${params.toString()}`);
      setCourses(res.data);
    } catch (err) {
      console.error('검색 실패:', err);
      alert('검색 중 오류 발생');
    }
  };

  useEffect(() => {
    api.get('/api/codes/multiple?groups=ASSOCIATION,LEVEL,REGION')
      .then(res => setCodeOptions(res.data))
      .catch(err => console.error('코드 옵션 로드 실패', err));
  }, []);

  useEffect(() => {
    // 초기 전체 조회
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="course-search-condition">
      {/* <h2>과정 검색</h2> */}

      <div>
        <select name="association_code" value={filters.association_code} onChange={handleChange}>
          <option value="">협회 선택</option>
          {codeOptions.ASSOCIATION?.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        <select name="license_id" value={filters.license_id} onChange={handleChange}>
          <option value="">라이센스 선택</option>
          {licenseOptions.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <select name="level_code" value={filters.level_code} onChange={handleChange}>
          <option value="">레벨 선택</option>
          {codeOptions.LEVEL?.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        <select name="region_code" value={filters.region_code} onChange={handleChange}>
          <option value="">지역 선택</option>
          {codeOptions.REGION?.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        <input
          name="course_title"
          value={filters.course_title}
          onChange={handleChange}
          placeholder="과정명"
        />

        <input
          name="instructor_name"
          value={filters.instructor_name}
          onChange={handleChange}
          placeholder="강사명"
        />

        <button onClick={handleSearch}>검색</button>
      </div>

      <CourseSection title="검색 결과" courses={courses} />
    </div>
  );
}

export default CourseSearchPage;
