import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useProfile } from '../../../hooks/useProfile';
import ProfileHeader from '../../../components/profile/ProfileHeader';

export default function InstructorProfile() {
    const { id } = useParams();               // URL에 /instructor/:id 로 전달된 강사 ID
    const { user, loading: authLoading } = useAuth();
    const { data: profileUser, loading: profileLoading } = useProfile('instructor', id);

    if (authLoading) return <div className="profile-page">로딩 중…</div>;
    if (profileLoading) return <div className="profile-page">로딩 중…</div>;
    if (!profileUser) return <div className="profile-page">강사를 찾을 수 없습니다.</div>;

    const owner = user?.userType === 'instructor' && user?.id === Number(id);

    return (
        <div>
            <ProfileHeader
                name={profileUser.name}
                avatarUrl={profileUser.avatarUrl}
                owner={owner}
            />
        </div>
    );
}
