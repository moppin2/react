function ReserveBox( courseid ) {
    console.log("reservebox",courseid)
    return (
        <div className="reserve-box">
            <div>
                <p>{courseid.courseid}-2025/04/11(수)` : "과정을 선택하세요"</p>
                <p>수업명 : 이론수업</p>
                <p>수업장소 : 강동구 사무실</p>
                <p>정원 : 7/8명</p>
            </div>
            <div>
                <button>예약하기</button>
            </div>
        </div>
    );
  }
  
  export default ReserveBox;