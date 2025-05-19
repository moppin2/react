import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useParams } from 'react-router-dom';

function RejectReasonModal({ visible, onClose, onConfirm }) {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (reason.trim() === '') {
            alert('거절 사유를 입력해주세요.');
            return;
        }
        onConfirm(reason);
        setReason('');
    };

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white', padding: '1.5rem', borderRadius: '4px',
                    width: '400px', maxWidth: '90%',
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3>거절 사유 입력</h3>
                <textarea
                    rows={5}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    placeholder="거절 사유를 입력해주세요."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                />
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button onClick={handleConfirm} style={{ marginRight: '1rem' }}>확인</button>
                    <button onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
}

export default function EnrollmentApprovePage() {
    const [courses, setCourses] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({}); // { [application_id]: true }
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const { courseId } = useParams();

    useEffect(() => {
        const url = courseId
            ? `/api/enrollments/pending-by-instructor/${courseId}`
            : '/api/enrollments/pending-by-instructor';

        api.get(url)
            .then(res => setCourses(res.data))
            .catch(err => {
                console.error('수강 신청 목록 불러오기 실패:', err);
                alert('수강 신청 목록을 불러올 수 없습니다.');
            });
    }, [courseId]);

    const handleCheckboxChange = (applicationId, checked) => {
        setSelectedUsers(prev => ({
            ...prev,
            [applicationId]: checked,
        }));
    };

    const handleApprove = async () => {
        const selectedIds = Object.entries(selectedUsers)
            .filter(([_, isChecked]) => isChecked)
            .map(([id]) => parseInt(id));

        if (selectedIds.length === 0) {
            return alert('선택된 수강생이 없습니다.');
        }

        try {
            await api.post('/api/enrollments/approve', {
                application_ids: selectedIds,
            });
            alert('승인이 완료되었습니다.');
            window.location.reload(); // 또는 다시 API 호출
        } catch (err) {
            console.error('처리 실패:', err);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    const handleRejectClick = () => {
        const selectedIds = Object.entries(selectedUsers)
            .filter(([_, isChecked]) => isChecked)
            .map(([id]) => parseInt(id));

        if (selectedIds.length === 0) {
            return alert('선택된 수강생이 없습니다.');
        }
        setIsRejectModalOpen(true);
    };

    const handleRejectConfirm = async (reason) => {
        const selectedIds = Object.entries(selectedUsers)
            .filter(([_, isChecked]) => isChecked)
            .map(([id]) => parseInt(id));

        try {
            await api.post('/api/enrollments/reject', {
                application_ids: selectedIds,
                reason,
            });
            alert('거절이 완료되었습니다.');
            setIsRejectModalOpen(false);
            window.location.reload(); // 또는 다시 API 호출
        } catch (err) {
            console.error('처리 실패:', err);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>수강 신청 승인</h2>
            {courses.length === 0 && <p>현재 승인 대기 중인 신청이 없습니다.</p>}

            {courses.map(course => (
                <div key={course.course_id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
                    <h3>{course.course_title}</h3>
                    <ul>
                        {course.pending_users.map(user => (
                            <li key={user.application_id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedUsers[user.application_id]}
                                        onChange={(e) =>
                                            handleCheckboxChange(user.application_id, e.target.checked)
                                        }
                                    />
                                    {user.name} ({user.email})
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            <div style={{ marginTop: '1rem' }}>
                <button onClick={handleApprove} style={{ marginRight: '1rem' }}>✅ 승인</button>
                <button onClick={handleRejectClick}>❌ 거절</button>
            </div>

            <RejectReasonModal
                visible={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={handleRejectConfirm}
            />
        </div>
    );
}
