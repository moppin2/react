// src/components/course/CourseList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import UserBadge from '../../../components/common/UserBadge';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  Chip,
  useTheme,
  CircularProgress,
} from '@mui/material';

export default function CourseList({ courses = [], loading, type = 'default' }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!Array.isArray(courses) || courses.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        표시할 과정이 없습니다.
      </Typography>
    );
  }

  return (
    <Stack
      spacing={2}
      sx={{
        px: 1,
        py: 1,
        alignItems: 'center',
      }}
    >
      {courses.map((course) => (
        <Card
          key={course.id}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: theme.shape.borderRadius,
            width: '100%',
            maxWidth: 800,
            overflow: 'hidden',
          }}
        >
          {/* 이미지 + 제목 영역 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              width: '100%',
              p: theme.spacing(1),
            }}
          >
            {/* 썸네일 래퍼 */}
            <Box
              sx={{
                position: 'relative',
                width: 112,
                minWidth: 112,
                height: 112,
                backgroundColor: theme.palette.secondary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              {course.thumbnail_url ? (
                <CardMedia
                  component="img"
                  image={course.thumbnail_url}
                  alt="썸네일"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.secondary.main,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    No Image
                  </Typography>
                </Box>
              )}

              {!course.is_published && (
                <Chip
                  label="비공개"
                  size="small"
                  clickable={false}
                  sx={{
                    position: 'absolute',
                    top: theme.spacing(0.5),
                    left: theme.spacing(0.5),
                    bgcolor: theme.palette.action.disabledBackground,
                    color: theme.palette.text.disabled,
                    pointerEvents: 'none',
                    borderRadius: theme.shape.borderRadius / 2,
                  }}
                />
              )}
            </Box>

            {/* 제목 + 강사 */}
            <Box
              sx={{
                flex: 1,
                px: theme.spacing(1),
                pb: theme.spacing(1),
              }}
            >
              <Typography
                variant="subtitle1"
                component={Link}
                to={`/course/${course.id}`}
                sx={{
                  textDecoration: 'none',
                  color: theme.palette.text.primary,
                  fontWeight: 'normal',
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  display: 'block',
                  pb: 1.3,
                }}
              >
                {course.title}
              </Typography>
              <UserBadge
                user={course.instructor}
                avatarUrl={course.instructor_avatar_url}
                showUserType={false}
              />
            </Box>
          </Box>

          {/* 태그 & 버튼 영역 */}
          <CardContent
            sx={{
              pt: theme.spacing(1),
              pb: theme.spacing(2),
              pl: theme.spacing(1),
              pr: theme.spacing(2),
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {
                  [
                    course.license_association,
                    course.license_name,
                    course.level_name,
                    course.region_name,
                  ].map((label, idx) => (
                    <Chip
                      key={idx}
                      label={label}
                      size="small"
                      clickable={false}
                      sx={{
                        bgcolor: theme.palette.secondary.main,
                        color: theme.palette.primary.main,
                        borderRadius: theme.shape.borderRadius / 2,
                        pointerEvents: 'none',
                      }}
                    />
                  ))
                }
              </Stack>

              {type === 'instructor' && (
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" color="primary">
                    수강생{course.approved_count > 0 && ` (${course.approved_count})`}
                  </Button>
                  <Button
                    component={Link}
                    to={`/course/edit/${course.id}`}
                    variant="outlined"
                    size="small"
                    color="primary"
                  >
                    수정
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
