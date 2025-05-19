import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
// import "./Login.css";

function Login() {  
  const [userType, setUserType] = useState('user');
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("Wkdrndi!1"); //짱구야!1
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // PrivateRoute가 넣어둔 원래 경로 (없으면 '/')
  const from = location.state?.from?.pathname || '/'  

  const handleTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    
    try {
      await login({ userType, email, password })
      // 로그인 성공하면 원래 경로로 이동
      navigate(from, { replace: true })
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

    return (
      <div>
        <form className="login-form" onSubmit={handleLogin}>
          <h2>로그인</h2>
          
          <div className="user-type">
            <label>
              <input
                type="radio"
                name="userType"
                value="user"
                checked={userType === 'user'}
                onChange={handleTypeChange}
              /> 일반회원
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="instructor"
                checked={userType === 'instructor'}
                onChange={handleTypeChange}
              /> 강사회원
            </label>
          </div>

          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">로그인</button>
        </form>
      </div> 
    );
  }
  
  export default Login;
  