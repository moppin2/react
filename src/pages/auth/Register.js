import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Register.css';
import api from '../../services/api';


export default function Register() {
  const navigate = useNavigate()
  const { manualLogin } = useAuth()

  const temp_pwd = 'Wkdrndi!1'; //짱구야!1
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    email: 'test@test.com',
    password: temp_pwd,
    confirmPassword: temp_pwd,
    name: '테스트유저',
    phone: '01057312331',
    careerYears: '5',
    majorCareer: '',
    introduction: ''
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    setPasswordMatch(formData.password === formData.confirmPassword);
  }, [formData.password, formData.confirmPassword]);

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.password));
  }, [formData.password]);

  const getPasswordStrength = (password) => {
    if (!password) return '';
    const strongRegex = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
    );
    if (strongRegex.test(password)) return '강함';
    if (password.length >= 6) return '보통';
    return '약함';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    setUserType(e.target.value); 

    //테스트용 자동입력
    if (e.target.value === 'user') {
      setFormData((prev) => ({ ...prev, name: '테스트유저' }));
    } else {
      setFormData((prev) => ({ ...prev, name: '테스트강사' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordMatch || passwordStrength !== '강함') return;

    const payload = { ...formData };
    if (userType === 'user') {
      delete payload.careerYears;
      delete payload.majorCareer;
      delete payload.introduction;
    }

    const endpoint = userType === 'user' ? process.env.REACT_APP_API_URL + '/api/register/user' : process.env.REACT_APP_API_URL + '/api/register/instructor';


    try {
      const res = await api.post(endpoint, payload);
      if (res.status >= 200 && res.status < 300) {
        alert('가입 완료!');
        console.log(res.data);
        manualLogin(res.data); // ✅ 로그인 상태 수동 갱신
        navigate(userType === 'instructor' ? '/instructor/verify' : '/');

      } else {
        alert('가입 실패');
      }
    } catch (err) {
      const msg = err.response?.data?.message || '회원가입 실패';
      alert(msg);  // ✅ 여기서 서버가 보낸 message를 alert로 출력
    }
  };

  return (
    <div className="register-container">
      <h2>회원가입</h2>
      <div className="user-type">
        <label>
          <input
            type="radio"
            name="userType"
            value="user"
            checked={userType === 'user'}
            onChange={handleTypeChange}
          /> 일반회원
        </label>
        <label>
          <input
            type="radio"
            name="userType"
            value="instructor"
            checked={userType === 'instructor'}
            onChange={handleTypeChange}
          /> 강사회원
        </label>
      </div>
      <form onSubmit={handleSubmit} className="register-form">
        <input type="email" name="email" placeholder="이메일" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="비밀번호" value={formData.password} onChange={handleChange} required />
        <div className={`password-strength ${passwordStrength}`}>비밀번호 강도: {passwordStrength}</div>
        <input type="password" name="confirmPassword" placeholder="비밀번호 확인" value={formData.confirmPassword} onChange={handleChange} required />
        {!passwordMatch && <div className="error">비밀번호가 일치하지 않습니다.</div>}
        <input type="text" name="name" placeholder="닉네임" value={formData.name} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="전화번호" value={formData.phone} onChange={handleChange} required />

        {userType === 'instructor' && (
          <>
            <input type="number" name="careerYears" placeholder="경력 (년수)" value={formData.careerYears} onChange={handleChange} required />
            <input type="text" name="majorCareer" placeholder="주요경력 (선택)" value={formData.majorCareer} onChange={handleChange} />
            <textarea name="introduction" placeholder="소개글 (선택)" value={formData.introduction} onChange={handleChange} />
          </>
        )}

        <button type="submit">가입하기</button>
      </form>
    </div>
  );
}
