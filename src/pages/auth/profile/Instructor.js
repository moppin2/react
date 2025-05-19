import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import './Instructor.css';

export default function InstructorProfile() {
    const { id } = useParams();               // URL에 /instructor/:id 로 전달된 강사 ID
    const [instructor, setInstructor] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                // 1) 강사 기본 정보 조회 (이름 등)
                const { data: instr } = await api.get(`/api/instructor/${id}`);
                setInstructor(instr);

                // 2) 프로필 사진 조회
                const { data: files } = await api.get('/api/upload/list', {
                    params: {
                        target_type: 'instructor',
                        target_id: id,
                        purpose: 'profile',
                    }
                });
                if (files.length > 0) {
                    const bucketName = process.env.REACT_APP_S3_BUCKET_NAME;
                    const publicUrl = `https://${bucketName}.s3.amazonaws.com/${files[0].file_key}`;
                    setAvatarUrl(publicUrl);
                }
            } catch (err) {
                console.error('프로필 로딩 실패', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [id]);

    if (loading) return <div className="profile-page">로딩 중…</div>;
    if (!instructor) return <div className="profile-page">강사를 찾을 수 없습니다.</div>;

    return (
        <div>
            <div className="function-area">
                <button>수정</button>
                <button>로그</button>
            </div>
            <div className="profile-page">
                <div className="profile-card">
                    <div className="avatar-wrapper">
                        {avatarUrl
                            ? <img src={avatarUrl} alt={`${instructor.name} 프로필`} />
                            : <div className="avatar-placeholder">No Image</div>
                        }
                    </div>
                    <h2 className="name">{instructor.name}</h2>
                </div>
            </div>
        </div>
    );
}
