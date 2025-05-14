import { Link } from "react-router-dom";
import data from "../assets/data/dummy.json";
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const getUserLabel = (userType) => {
  switch (userType) {
    case 'admin':
      return ' (관리자)';
    case 'instructor':
      return ' (강사회원)';
    default:
      return ' (일반회원)';
  }
};

function Menu() {

  const { user, loading, logout } = useAuth()
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 성공하면 리다이렉트 or 상태 초기화
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) return <nav>Loading…</nav>;

  return (
    <div>
      <nav className="Nav">
        <div><Link to="/">LOGO</Link></div>
        <ul className="Menu">
          {data.menu.filter((item) => item.type === "" && item.active).map((item, index) => (
            <li key={index}><Link to={item.link}>{item.name}</Link></li>
          ))}
          {
            user &&
            data.menu.filter((item) => item.type === user.userType && item.active).map((item, index) => (
              <li key={index}><Link to={item.link}>{item.name}</Link></li>
            ))
          }
        </ul>
        {
          user ?
            <div className="LoginInfo">
              <div>{user.username}님 {getUserLabel(user.userType)}
              </div>
              <div><button onClick={handleLogout}>로그아웃</button></div>
            </div>
            :
            <div className="LoginInfo">
              <div><Link to="/register">회원가입</Link></div>
              <div><Link to="/login">로그인</Link></div>
            </div>
        }
      </nav>
    </div>
  );
}

export default Menu;
