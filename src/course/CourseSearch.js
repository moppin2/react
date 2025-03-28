import React, { useState } from 'react';
import CheckboxGroup from "./CheckboxGroup.js";
import data from "../data/dummy.json"

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
      {data.search.map((item, index) => (
        <CheckboxGroup title={item.title} options={item.value} onChange={handleChange} />
      ))}
      <button onClick={handleSearchClick}>조회하기</button>
    </div>
  );
}

export default CourseSearch;

