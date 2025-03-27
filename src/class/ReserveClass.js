import './ReserveClass.css';
import ReserveBox from './ReserveBox.js';

function ReserveClass() {
    return (
        <div className='reserve-wrap'>
            <h2>수업예약</h2>
            <div className='course-select'>
                <label htmlFor="course">과정선택</label>
                <select id="course">
                    <option>[홍길동] PADI ADVANCED</option>
                    <option>[홍길동] PADI OPEN WATER</option>
                    <option>[김철수] AIDA2</option>
                </select>
            </div>
            <ReserveBox />
        </div>
    );
  }
  
  export default ReserveClass;