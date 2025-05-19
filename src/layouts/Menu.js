import { Link } from "react-router-dom";
import data from "../assets/data/dummy.json";
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Menu.css';
import UserBadge from '../components/common/UserBadge';

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
    <nav className="navbar">
      <div className="brand"><Link to="/">LOGO</Link></div>
      <ul className="nav">
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
          <div className="user-info">
            <UserBadge user={user} avatarUrl={user.avatarUrl} />
            <span><button className="logout" onClick={handleLogout}>로그아웃</button></span>
          </div>
          :
          <div className="login-info">
            <div><Link to="/register">회원가입</Link></div>
            <div><Link to="/login">로그인</Link></div>
          </div>
      }
    </nav>
  );
}

export default Menu;
