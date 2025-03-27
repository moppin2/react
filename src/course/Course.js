import React, { useState } from 'react';
import CourseSearch from './CourseSearch';
import CourseSearchResult from './CourseSearchResult';
import './CheckboxGroup.css';


function Course() {
  const [results, setResults] = useState(null);

  return (
    <div className='course'>
      <CourseSearch onSearch={setResults} />
      <CourseSearchResult results={results} />
    </div>
  );
}

export default Course;