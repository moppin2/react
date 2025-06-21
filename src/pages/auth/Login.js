import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  useTheme,
} from '@mui/material';

export default function Login() {
  const theme = useTheme();
  const [userType, setUserType] = useState('user');
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("Wkdrndi!1");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      await login({ userType, email, password });
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: theme.spacing(2),
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={5}
          sx={{
            p: 4,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: theme.shape.borderRadius,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            로그인
          </Typography>

          <Box component="form" onSubmit={handleLogin}>
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel
                component="legend"
                sx={{ color: theme.palette.text.primary, fontSize: '0.9rem', mb: 1 }}
              >
                회원 유형
              </FormLabel>
              <RadioGroup
                row
                name="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                sx={{ justifyContent: 'center' }}
              >
                <FormControlLabel
                  value="user"
                  control={
                    <Radio
                      sx={{
                        color: theme.palette.primary.main,
                        '&.Mui-checked': { color: theme.palette.primary.main },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      일반회원
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="instructor"
                  control={
                    <Radio
                      sx={{
                        color: theme.palette.primary.main,
                        '&.Mui-checked': { color: theme.palette.primary.main },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      강사회원
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                input: { color: theme.palette.text.primary },
                backgroundColor: theme.palette.action.selected,
                borderRadius: 1,
              }}
            />
            <TextField
              fullWidth
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 3,
                input: { color: theme.palette.text.primary },
                backgroundColor: theme.palette.action.selected,
                borderRadius: 1,
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 'bold',
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}
            >
              로그인
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
