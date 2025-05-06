import React, { useState } from 'react';
import Condition from './Condition';
import Result from './Result';
import './CheckboxGroup.css';


function Search() {
  const [results, setResults] = useState(null);

  return (
    <div className='course'>
      <Condition onSearch={setResults} />
      <Result results={results} />
    </div>
  );
}

export default Search;