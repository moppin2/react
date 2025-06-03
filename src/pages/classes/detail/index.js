import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import ClassList from '../components/ClassList';
import api from '../../../services/api';

function ClassDetail() {
    const { classId } = useParams(); // URL에서 classId 가져오기
    const navigate = useNavigate();
    const { user, loading:userLoading } = useAuth();
    const [myClasses, setMyClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    // 1. 데이터 로딩 함수를 useCallback으로 정의
    const loadMyClasses = useCallback(async () => {
        if (user && user.id) { // user 객체와 user.id 존재 여부 확인
            setIsLoading(true);
            try {
                const res = await api.get(`/api/myclasses/${classId}`);
                setMyClasses(res.data);
            } catch (err) {
                console.error('수업 목록 조회 실패', err);
                setMyClasses([]); // 에러 발생 시 빈 배열로 설정
            } finally {
                setIsLoading(false);
            }
        } else {
            setMyClasses([]); // user 정보가 없으면 목록 비우기
        }
    }, [user, classId]);

    useEffect(() => {
        loadMyClasses();
    }, [loadMyClasses]); // loadMyClasses 함수 자체가 의존성

    console.log(myClasses);

    const handleCreateClass = () => {
        navigate('/class/create');
    };

    if ((isLoading || userLoading) && myClasses.length === 0) { // 초기 로딩 중이거나 user 정보 기다리는 중
        return <p>수업 목록을 불러오는 중...</p>;
    }

    return (
        <div className='class-manage'>
            <div className="function-area">
                {
                    (user.userType === 'instructor') &&
                    <button onClick={handleCreateClass}>수정하기</button>
                }

            </div>
            <ClassList
                classes={myClasses}
                refreshMyClasses={loadMyClasses}
                showDetail={true}
            />
        </div>
    );
}

export default ClassDetail;