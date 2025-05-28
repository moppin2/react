import { Link } from "react-router-dom";
import data from "../assets/data/dummy.json";
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import './Menu.css';
import UserBadge from '../components/common/UserBadge';

function Menu() {

  const { user, loading } = useAuth()

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
