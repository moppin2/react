import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import FeedbackForm from '../components/FeedbackForm';

export default function EditFeedbackPage() {
    const { feedbackId } = useParams();
    const navigate = useNavigate();

    const [initialFormValues, setInitialFormValues] = useState(null);
    const [studentName, setStudentName] = useState('');
    const [classIdForDisplay, setClassIdForDisplay] = useState('');
    const [submitting, setSubmitting] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadFeedbackForEdit = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. 피드백 기본 정보 및 이미지 정보 한 번에 가져오기
            const feedbackRes = await api.get(`/api/class-feedbacks/${feedbackId}`);
            const feedbackData = feedbackRes.data; // 이 안에 images 배열이 포함되어 있다고 가정

            if (!feedbackData) {
                throw new Error('피드백 정보를 찾을 수 없습니다.');
            }

            if (feedbackData.is_publication_requested !== null) {
                alert('임시 저장 상태의 피드백만 수정할 수 있습니다.');
                navigate(-1);
                return;
            }

            // (선택사항) 학생 이름, 수업 ID 등 표시용 정보 설정
            // feedbackData 객체 내에 user.name, class.id 등이 이미 포함되어 있다면 직접 사용
            setClassIdForDisplay(feedbackData.class_id || feedbackData.class?.id); // API 응답 구조에 따라
            setStudentName(feedbackData.user?.name || '알 수 없는 학생');


            setInitialFormValues({
                feedbackText: feedbackData.feedback_text || '',
                rating: feedbackData.rating ?? 5,
                images: feedbackData.images || [] // API 응답에 포함된 이미지 배열 사용
            });

        } catch (err) {
            console.error("Failed to load feedback for editing:", err);
            setError(err.response?.data?.message || "피드백 정보를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [feedbackId, navigate]);

    useEffect(() => {
        if (feedbackId) {
            loadFeedbackForEdit();
        } else {
            // ... (기존 ID 없음 에러 처리)
        }
    }, [feedbackId, loadFeedbackForEdit]);

    const handleSubmit = async (formData, uploadedImageList) => {
        // formData는 ClassFeedbackForm에서 넘어온 { feedbackText, rating, isPublicRequest } 형태
        // uploadedImageList는 ClassFeedbackForm에서 넘어온 [{ file_key, name, url }, ...] 형태

        if (!feedbackId) { // feedbackId가 유효한지 확인 (useEffect에서 이미 로드했겠지만)
            alert("수정할 피드백 ID가 올바르지 않습니다.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                feedback_text: formData.feedbackText,
                rating: formData.rating,
                file_keys: uploadedImageList ? uploadedImageList.map(file => file.file_key).filter(Boolean) : [],
                // 사용자님의 요청에 따라, is_publication_requested 관련 정보는 페이로드에서 제외합니다.
                // 백엔드의 updateFeedback 컨트롤러가 수정 시 is_publication_requested 등의 상태를
                // null 또는 false로 초기화하는 로직을 가지고 있습니다.
            };

            // API 호출: PUT 메서드 사용 및 URL에 feedbackId 포함
            await api.put(`/api/class-feedbacks/${feedbackId}`, payload);

            alert('피드백이 성공적으로 수정되었습니다.');
            navigate(-1); // 또는 목록 페이지 등 적절한 곳으로 이동

        } catch (err) {
            console.error('피드백 수정 실패:', err);
            const errorMessage = err.response?.data?.message || err.message || '피드백 수정 중 오류가 발생했습니다.';
            setError(errorMessage); // 에러 상태 업데이트
            alert(errorMessage);    // 사용자에게 알림
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p>피드백 정보를 불러오는 중…</p>;
    if (submitting) return <p>저장하는 중…</p>;
    if (error) return <p>오류: {error}</p>;
    if (!initialFormValues) return <p>피드백을 찾을 수 없거나 수정할 수 없는 상태입니다.</p>;

    return (
        <div className="edit-feedback-page-container">
            <FeedbackForm
                initialValues={initialFormValues}
                onSubmit={handleSubmit}
                // isSubmitting은 handleSubmit 내에서 관리하거나 props로 받아야 함
                existingFeedbackId={Number(feedbackId)}
            />
        </div>
    );
}