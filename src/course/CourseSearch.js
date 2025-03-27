import React, { useState } from 'react';
import CheckboxGroup from "./CheckboxGroup.js";
function CourseSearch({ onSearch }) {
  const [selected, setSelected] = useState({
    협회: [],
    레벨: [],
    지역: [],
  });

  const handleChange = (groupTitle, value, checked) => {
    setSelected((prev) => {
      const updatedGroup = checked
        ? [...prev[groupTitle], value]
        : prev[groupTitle].filter((item) => item !== value);
      return {
        ...prev,
        [groupTitle]: updatedGroup,
      };
    });
  };

  const handleSearchClick = () => {
    onSearch(selected); // 부모 컴포넌트(Course)로 전달
  };

  return (
    <div className='course-search'>
      <CheckboxGroup title="협회" options={['PADI', 'AIDA']} onChange={handleChange} />
      <CheckboxGroup title="레벨" options={['1', '2', '3', '4']} onChange={handleChange} />
      <CheckboxGroup title="지역" options={['서울', '경기', '인천']} onChange={handleChange} />
      <button onClick={handleSearchClick}>조회하기</button>
    </div>
  );
}

export default CourseSearch;

