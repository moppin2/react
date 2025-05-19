import ReserveBox from './ReserveBox.js';
import data from '../../../assets/data/dummy.json'
import React, { useState } from 'react';

function ReserveClass() {
    
    const [selected, setSelected] = useState(data.course[0].courseid);
    
    const handleChange = (e) => {
        const selectedCourseid = e.target.value;
        setSelected(selectedCourseid);
    };
  
    return (
        <div className='reserve-wrap'>
            <h2 className="course-title">수업예약</h2>
            <div className='course-select'>
                <label htmlFor="course">과정선택</label>
                <select id="course" onChange={handleChange}>
                    { data.course.map((item, index) => (
                        <option key={index} value={item.courseid}>[{item.director}] {item.title}</option>
                    ))};
                </select>
            </div>
            { data.class.filter((item) => item.courseid === selected).map((item, index) => (
                <ReserveBox key={index} classid={item.classid} />
            ))}
            
        </div>
    );
  }
  
  export default ReserveClass;