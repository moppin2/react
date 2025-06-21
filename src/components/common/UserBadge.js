import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const getUserLabel = (userType) => {
  switch (userType) {
    case 'admin':      return '관리자';
    case 'instructor': return '강사';
    default:           return '일반';
  }
};

export default function UserBadge({
  user,
  avatarUrl,
  showUserType = true,
  onSendMessage,
}) {
  const { user: loggedInUser, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => {
    if (!user || !user.id) return;
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  // 메뉴 아이템 생성 로직 (원본과 동일)
  const generateMenuItems = () => {
    const items = [];
    if (!user || !user.id) return items;
    const displayName = user.name || user.username || '사용자';
    const isMe = loggedInUser?.id === user.id && loggedInUser.userType === user.userType;

    if (isMe) {
      items.push({ label: '내 프로필 보기',      action: () => navigate(`/profile/${user.userType}/${user.id}`) });
      items.push({ label: '프로필 수정',          action: () => navigate(`/profile/edit`) });
      items.push({ isSeparator: true });
      items.push({
        label: '로그아웃',
        action: async () => {
          if (logout) await logout();
          navigate('/');
        },
      });
    } else if (loggedInUser) {
      items.push({ label: `${displayName} 프로필 보기`, action: () => navigate(`/profile/${user.userType}/${user.id}`) });
      if (onSendMessage) {
        items.push({ label: `${displayName}에게 쪽지 보내기`, action: () => onSendMessage(user) });
      }
    } else {
      items.push({ label: `${displayName} 프로필 보기`, action: () => navigate(`/profile/${user.userType}/${user.id}`) });
    }

    return items;
  };

  const menuItems = generateMenuItems();

  if (!user || !user.id) return null;

  const displayName = user.name || user.username || '사용자';
  const initial = displayName[0].toUpperCase();
  const label = getUserLabel(user.userType);

  return (
    <>
      <Box
        display="inline-flex"
        alignItems="center"
      >
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{
            p: 0,
            '&:hover': { backgroundColor: theme.palette.action.hover },
          }}
          aria-controls={open ? 'user-badge-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          {avatarUrl
            ? <Avatar src={avatarUrl} alt={displayName} sx={{ width: 32, height: 32 }} />
            : <Avatar sx={{ width: 32, height: 32 }}>{initial}</Avatar>
          }
          <Box ml={1} textAlign="left">
            <Typography variant="body2" component="span">
              {displayName}
            </Typography>
            {showUserType && (
              <Chip
                label={label}
                size="small"
                sx={{ ml: 0.5, height: 20, fontSize: '0.65rem' }}
                color={
                  user.userType === 'admin' ? 'error'
                  : user.userType === 'instructor' ? 'primary'
                  : 'default'
                }
              />
            )}
          </Box>
        </IconButton>
      </Box>

      <Menu
        id="user-badge-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ elevation: 3, sx: { mt: 1 } }}
      >
        {menuItems.map((item, idx) => (
          item.isSeparator
            ? <Divider key={`div-${idx}`} />
            : (
              <MenuItem
                key={item.label + idx}
                onClick={() => { item.action(); handleClose(); }}
              >
                {item.label}
              </MenuItem>
            )
        ))}
      </Menu>
    </>
  );
}

UserBadge.propTypes = {
  user: PropTypes.shape({
    id:       PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name:     PropTypes.string,
    username: PropTypes.string,
    userType: PropTypes.string,
  }).isRequired,
  avatarUrl:    PropTypes.string,
  showUserType: PropTypes.bool,
  onSendMessage: PropTypes.func,
};
