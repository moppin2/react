import React from 'react';
import PropTypes from 'prop-types';
import './UserBadge.css';
import { Link } from 'react-router-dom';

const getUserLabel = (userType) => {
  switch (userType) {
    case 'admin':
      return '관리자';
    case 'instructor':
      return '강사';
    default:
      return '일반';
  }
};

export default function UserBadge({ user, avatarUrl, showUserType = true }) {
  // 사용자 정보가 없으면 아무것도 렌더링하지 않음
  if (!user) return null;

  const label = getUserLabel(user.userType);
  // 이름 또는 username을 우선 사용
  const displayName = user.name || user.username || '';
  // 문자열이 있을 때만 첫 글자 사용
  const initial = displayName ? displayName[0] : '';

  return (
    <div className="user-badge">
      {avatarUrl ? (
        <img
          className="user-badge__avatar"
          src={avatarUrl}
          alt={`${displayName} 프로필`}
        />
      ) : (
        <span className="user-badge__avatar placeholder">
          {initial}
        </span>
      )}

      <Link to={`/profile/${user.userType}/${user.id}`}>
        <span className="user-badge__name">{displayName}</span>
      </Link>
      {showUserType && (
        <span className={`user-badge__label user-badge__label--${user.userType}`}>{label}</span>
      )}
    </div>
  );
}

UserBadge.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    userType: PropTypes.string.isRequired,
    name: PropTypes.string,
    username: PropTypes.string,
  }),
  avatarUrl: PropTypes.string,
};

UserBadge.defaultProps = {
  user: null,
  avatarUrl: null,
};