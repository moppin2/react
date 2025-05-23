import React from 'react';
import './ProfileHeader.css';

export default function ProfileHeader({ name, avatarUrl, owner }) {
    return (
        <div>
            <div className="function-area">
                {
                    owner && <button>수정</button>
                }
                <button>공개된 수업</button>
                <button>공개된 후기</button>
            </div>
            <div className="profile-page">
                <div className="profile-card">
                    <div className="avatar-wrapper">
                        {avatarUrl
                            ? <img src={avatarUrl} alt={`${name} 프로필`} />
                            : <div className="avatar-placeholder">No Image</div>
                        }
                    </div>
                    <h2 className="name">{name}</h2>
                </div>
            </div>
        </div>
    );
}
