import React, { useState } from 'react';
import CourseSearch from './CourseSearch';
import CourseSearchResult from './CourseSearchResult';

function Course() {
  const [results, setResults] = useState(null);

  return (
    <div>
      <CourseSearch onSearch={setResults} />
      <CourseSearchResult results={results} />
    </div>
  );
}

export default Course;