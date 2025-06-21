// src/pages/course/CourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Chip,
  Button,
  List,
  ListItem,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBackIosNew as PrevIcon,
  ArrowForwardIos as NextIcon,
} from '@mui/icons-material';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const [course, setCourse] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    api
      .get(`/api/course/${id}`)
      .then(res => setCourse(res.data))
      .catch(err => {
        console.error('과정 상세 조회 실패', err);
        alert('해당 과정을 조회할 수 없습니다.');
        navigate('/course/search');
      });
  }, [id, navigate]);

  const handleRequest = async () => {
    try {
      await api.post(`/api/enrollments/request`, { course_id: course.id });
      alert('수강 신청이 완료되었습니다.');
    } catch (err) {
      console.error('수강 신청 실패:', err);
      alert('수강 신청 중 오류가 발생했습니다.');
    }
  };

  const openGallery = idx => {
    setCurrentIdx(idx);
    setGalleryOpen(true);
  };
  const closeGallery = () => setGalleryOpen(false);
  const prevImage = () =>
    setCurrentIdx(i => (i === 0 ? course.galleryImages.length - 1 : i - 1));
  const nextImage = () =>
    setCurrentIdx(i =>
      i === course.galleryImages.length - 1 ? 0 : i + 1
    );

  if (!course) {
    return (
      <Box
        sx={{
          p: 2,
          textAlign: 'center',
        }}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: 2,
        pt: isMobile ? theme.spacing(9) : theme.spacing(2),
        pb: isMobile ? theme.spacing(7) : theme.spacing(2),
        position: 'relative',
        maxWidth: '800px',
        mx: 'auto',
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* 기본 정보 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {course.coverImageUrl && (
            <Grid item xs={12} sm={4}>
              <Box
                component="img"
                src={course.coverImageUrl}
                alt="커버 이미지"
                sx={{
                  width: '100%',
                  borderRadius: theme.shape.borderRadius,
                }}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={course.coverImageUrl ? 8 : 12}>
            <Typography variant="h4" gutterBottom>
              {course.title}
            </Typography>
            <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                course.license_association,
                course.license_name,
                course.level_name,
                course.region_name,
              ].map((label, i) => (
                <Chip key={i} label={label} size="small" />
              ))}
            </Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              강사: {course.instructor_name}
            </Typography>
            {user?.userType === 'user' && course.is_published && (
              <Button variant="contained" onClick={handleRequest}>
                수강 신청
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* 과정 설명 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          과정 설명
        </Typography>
        <Typography>{course.description}</Typography>
      </Paper>

      {/* 커리큘럼 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          커리큘럼
        </Typography>
        <Typography>{course.curriculum}</Typography>
      </Paper>

      {/* 수료 기준 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          수료 기준
        </Typography>
        <List>
          {course.criteriaList.map((c, i) => (
            <ListItem key={i}>
              {c.type}: {c.value}
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* 갤러리 */}
      {course.galleryImages?.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            갤러리
          </Typography>
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 1,
              py: 1,
            }}
          >
            {course.galleryImages.map((img, i) => (
              <Box
                key={i}
                component="img"
                src={img.url}
                alt={`gallery-${i}`}
                sx={{
                  height: 100,
                  borderRadius: theme.shape.borderRadius,
                  cursor: 'pointer',
                  flex: '0 0 auto',
                }}
                onClick={() => openGallery(i)}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* 전체화면 갤러리 모달 */}
      <Dialog
        open={galleryOpen}
        onClose={closeGallery}
        fullScreen
        PaperProps={{
          sx: { bgcolor: 'rgba(0,0,0,0.9)' },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: 'relative',
            textAlign: 'center',
          }}
        >
          {/* 이전 */}
          <IconButton
            onClick={prevImage}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#fff',
            }}
          >
            <PrevIcon />
          </IconButton>

          {/* 현재 이미지 */}
          <Box
            component="img"
            src={course.galleryImages[currentIdx].url}
            alt={`gallery-large-${currentIdx}`}
            sx={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              m: 'auto',
            }}
          />

          {/* 다음 */}
          <IconButton
            onClick={nextImage}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#fff',
            }}
          >
            <NextIcon />
          </IconButton>

          {/* 닫기 */}
          <IconButton
            onClick={closeGallery}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#fff',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
