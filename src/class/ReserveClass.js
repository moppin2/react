import './ReserveClass.css';
import ReserveBox from './ReserveBox.js';
import data from '../data/dummy.json'
import React, { useState } from 'react';

function ReserveClass() {
    
    const [selected, setSelected] = useState(data.course[0].courseid);
    
    const handleChange = (e) => {
        // console.log(e.target.value)
        const selectedCourseid = e.target.value;
        setSelected(selectedCourseid);
    };
  
    return (
        <div className='reserve-wrap'>
            <h2>수업예약</h2>
            <div className='course-select'>
                <label htmlFor="course">과정선택</label>
                <select id="course" onChange={handleChange}>
                    { data.course.map((item, index) => (
                        <option key={index} value={item.courseid}>[{item.director}] {item.title}</option>
                    ))};
                </select>
            </div>
            <ReserveBox courseid={selected} />
        </div>
    );
  }
  
  export default ReserveClass;