import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import CourseSection from '../components/CourseSection';
import api from '../../../services/api';

import {
  Box,
  Fab,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

export default function CourseManage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    api
      .get(`/api/courses?instructor_id=${user.id}`)
      .then(res => setMyCourses(res.data))
      .catch(err => console.error('과정 목록 조회 실패', err))
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleCreateCourse = () => {
    navigate('/course/create');
  };

  return (
    <Box
      sx={{
        px: 1,
        pt: isMobile ? theme.spacing(8) : theme.spacing(2),
        pb: isMobile ? theme.spacing(9) : theme.spacing(2),
        position: 'relative',
        maxWidth: '800px',
        mx: 'auto',
        bgcolor: theme.palette.background.default,
      }}
    >
      <CourseSection
        title={`${user?.username} 강사님 과정 리스트`}
        courses={myCourses}
        loading={loading}
        type="instructor"
      />

      <Fab
        onClick={handleCreateCourse}
        sx={{
          position: 'fixed',
          bottom: isMobile ? theme.spacing(11) : theme.spacing(3),
          right: theme.spacing(3),
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            bgcolor: theme.palette.primary.dark ?? alpha(theme.palette.primary.main, 0.9),
          },
          zIndex: theme.zIndex.tooltip + 1,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
