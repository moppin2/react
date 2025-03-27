import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Course from "./course/Course.js";
import Home from "./Home.js";

function App() {
  return (
    <Router>      
      <nav className="App">
        <div><Link to="/">logo</Link></div>
        <ul className="Menu">
          <li>서비스소개</li>
          <li><Link to="/course">과정등록</Link></li>
        </ul>
        <div className="LoginInfo">
          <div>회원가입</div>
          <div>로그인</div>
        </div> 
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course" element={<Course />} />
      </Routes>
    </Router>
  );
}

export default App;
