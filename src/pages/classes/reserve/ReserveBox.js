import data from "../../../assets/data/dummy.json";

function ReserveBox( props ) {
    return (
        <div className="reserve-box">
                {
                    data.class.filter((item) => item.classid === props.classid ).map((item) => (
                        <div key={item.classid}>
                            <p>일정 : {item.date} {item.time}</p>
                            <p>수업명 : {item.title}</p>
                            <p>장소 : {item.place}</p>
                            <p>정원 : {item.occupied}/{item.seats}명</p> 
                        </div>
                    ))
                }
            <div>
                <button>예약하기</button>
            </div>
        </div>
    )
  }
  
  export default ReserveBox;