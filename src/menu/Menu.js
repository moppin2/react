
import { Link } from "react-router-dom";

function Menu() {
    return (
      <div>
        <nav className="Nav">
          <div><Link to="/">logo</Link></div>
          <ul className="Menu">
            <li><Link to="/service">서비스소개</Link></li>
            <li><Link to="/course">과정등록</Link></li>
            <li><Link to="/class">수업예약</Link></li>
          </ul>
          <div className="LoginInfo">
            <div><Link to="/join">회원가입</Link></div>
            <div><Link to="/login">로그인</Link></div>
          </div> 
        </nav>
    </div>
    );
  }
  
  export default Menu;
  