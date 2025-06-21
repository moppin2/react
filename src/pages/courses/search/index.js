import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import CourseSection from '../components/CourseSection';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

export default function CourseSearchPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filters, setFilters] = useState({
    association_code: '',
    license_id: '',
    level_code: '',
    region_code: '',
    course_title: '',
    instructor_name: '',
  });
  const [codeOptions, setCodeOptions] = useState({ ASSOCIATION: [], LEVEL: [], REGION: [] });
  const [licenseOptions, setLicenseOptions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // 코드 옵션 로드
  useEffect(() => {
    api.get('/api/codes/multiple?groups=ASSOCIATION,LEVEL,REGION')
       .then(res => setCodeOptions(res.data))
       .catch(() => setCodeOptions({ ASSOCIATION: [], LEVEL: [], REGION: [] }));
  }, []);

  // 초기 전체 조회
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name === 'association_code') {
      api.get(`/api/licenses?association=${value}`)
         .then(res => setLicenseOptions(res.data))
         .catch(() => setLicenseOptions([]));
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/api/courses?${params.toString()}`);
      setCourses(res.data);
    } catch {
      alert('검색 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  // 공통 필드 스타일
  const fieldSx = {
    backgroundColor: theme.palette.secondary.main,
    borderRadius: theme.shape.borderRadius,
    '& .MuiOutlinedInput-root': {
      color: theme.palette.text.primary,
      '& fieldset': { borderColor: theme.palette.primary.main },
      '&:hover fieldset': { borderColor: theme.palette.primary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      '&.Mui-focused': { color: theme.palette.primary.main },
    },
  };

  return (
    <Box
      sx={{
        px: theme.spacing(1),
        pt: theme.spacing(isMobile ? 8 : 2),
        pb: theme.spacing(isMobile ? 9 : 2),
        maxWidth: 800,
        mx: 'auto',
        bgcolor: theme.palette.background.default,
      }}
    >
      <Grid container spacing={1} mb={2} px={1} pt={1}>
        {/* 드롭다운: 모바일 2씩, 데스크탑 4열 */}
        <Grid size={{ xs: 6, md: 3 }}>
          <FormControl fullWidth size="small" variant="outlined" sx={fieldSx}>
            <InputLabel>협회</InputLabel>
            <Select
              name="association_code"
              value={filters.association_code}
              label="협회"
              onChange={handleChange}
              MenuProps={{ PaperProps: { sx: { bgcolor: theme.palette.secondary.main, color: theme.palette.text.primary } } }}
            >
              <MenuItem value=""><em>전체</em></MenuItem>
              {codeOptions.ASSOCIATION.map(c => (
                <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <FormControl fullWidth size="small" variant="outlined" sx={fieldSx}>
            <InputLabel>라이센스</InputLabel>
            <Select
              name="license_id"
              value={filters.license_id}
              label="라이센스"
              onChange={handleChange}
              MenuProps={{ PaperProps: { sx: { bgcolor: theme.palette.secondary.main, color: theme.palette.text.primary } } }}
            >
              <MenuItem value=""><em>전체</em></MenuItem>
              {licenseOptions.map(l => (
                <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <FormControl fullWidth size="small" variant="outlined" sx={fieldSx}>
            <InputLabel>레벨</InputLabel>
            <Select
              name="level_code"
              value={filters.level_code}
              label="레벨"
              onChange={handleChange}
              MenuProps={{ PaperProps: { sx: { bgcolor: theme.palette.secondary.main, color: theme.palette.text.primary } } }}
            >
              <MenuItem value=""><em>전체</em></MenuItem>
              {codeOptions.LEVEL.map(c => (
                <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <FormControl fullWidth size="small" variant="outlined" sx={fieldSx}>
            <InputLabel>지역</InputLabel>
            <Select
              name="region_code"
              value={filters.region_code}
              label="지역"
              onChange={handleChange}
              MenuProps={{ PaperProps: { sx: { bgcolor: theme.palette.secondary.main, color: theme.palette.text.primary } } }}
            >
              <MenuItem value=""><em>전체</em></MenuItem>
              {codeOptions.REGION.map(c => (
                <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 과정명 + 강사명 + 검색 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="과정명"
            name="course_title"
            value={filters.course_title}
            onChange={handleChange}
            sx={fieldSx}
          />
        </Grid>

        <Grid size={{ xs: 9, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="강사명"
            name="instructor_name"
            value={filters.instructor_name}
            onChange={handleChange}
            sx={fieldSx}
          />
        </Grid>

        <Grid size={{ xs: 3, md: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSearch}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.9) },
              height: 40,
            }}
          >
            검색
          </Button>
        </Grid>
      </Grid>

      <CourseSection title="검색 결과" courses={courses} loading={loading} />
    </Box>
  );
}
